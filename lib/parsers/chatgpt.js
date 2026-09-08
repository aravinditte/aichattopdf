/**
 * ChatGPT shared conversation extractor.
 *
 * Public share pages (https://chatgpt.com/share/<uuid>) embed the conversation
 * as a turbo-stream payload: a flat JSON array where objects map `_N` keys
 * (N = index of the key-name string in the same array) to value indices.
 * The payload is delivered inside:
 *   window.__reactRouterContext.streamController.enqueue("...")
 *
 * Decode steps:
 *   1. Extract the enqueued JS string literal and JSON.parse it -> flat array.
 *   2. Hydrate: objects' `_N` keys become real names; numeric values resolve to
 *      their element in the array (string literals stay strings).
 *   3. Read `serverResponse`: title + linear_conversation (ordered nodes with
 *      message.author.role / message.content.content_type / message.content.parts).
 *   4. Keep user/assistant nodes with content_type "text" (skip system, tool
 *      calls, thoughts, code, model_editable_context).
 *
 * Deleted/inaccessible conversations still return HTTP 200 but carry
 * {type: "error", error: "Conversation has been deleted..."} in the payload.
 */

const SHARE_URL = 'https://chatgpt.com/share/';
const FETCH_TIMEOUT_MS = 20000;
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

export async function parseChatGPT(shareId, sourceUrl) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(SHARE_URL + shareId, {
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'text/html,application/xhtml+xml',
      },
      signal: controller.signal,
      redirect: 'follow',
    });

    if (res.status === 404) {
      throw Object.assign(new Error('not_found'), { statusCode: 404 });
    }
    if (res.status === 403) {
      throw Object.assign(new Error('not_public'), { statusCode: 403 });
    }
    if (!res.ok) {
      throw Object.assign(new Error(`ChatGPT returned ${res.status}`), { statusCode: 502 });
    }

    const html = await res.text();
    return extractFromShareHtml(html, sourceUrl);
  } catch (error) {
    if (error.name === 'AbortError') {
      throw Object.assign(new Error('Timed out fetching the conversation.'), { statusCode: 504 });
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Extract the turbo-stream payload from raw share-page HTML and normalize it.
 * Exported for tests against saved snapshots.
 */
export function extractFromShareHtml(html, sourceUrl) {
  const arr = extractTurboStreamArray(html);
  if (!arr) {
    throw Object.assign(
      new Error("Couldn't find the conversation data in the share page."),
      { statusCode: 502 }
    );
  }

  const hydrated = hydrateRoot(arr);

  // Deleted / unavailable conversations carry an explicit error object.
  const errorObj = findError(hydrated);
  if (errorObj) {
    throw Object.assign(new Error(errorObj), { statusCode: 404 });
  }

  const title =
    hydrated.serverResponse?.title || hydrated.pageTitle || 'ChatGPT Conversation';

  const nodes = hydrated.serverResponse?.linear_conversation || [];
  const messages = [];

  for (const node of nodes) {
    const msg = node?.message;
    if (!msg?.author?.role || !msg?.content) continue;

    const role = msg.author.role;
    if (role !== 'user' && role !== 'assistant') continue;

    const contentType = msg.content.content_type;
    if (contentType !== 'text') continue; // skip code/tool/thoughts/system payload types

    const parts = Array.isArray(msg.content.parts) ? msg.content.parts : [];
    const content = parts
      .filter((p) => typeof p === 'string')
      .join('\n')
      .trim();
    if (!content) continue;

    messages.push({ role, content });
  }

  if (messages.length === 0) {
    throw Object.assign(
      new Error('No readable messages were found in this conversation.'),
      { statusCode: 422 }
    );
  }

  return { title, platform: 'chatgpt', sourceUrl, messages };
}

/**
 * Pull the turbo-stream flat array out of the share page HTML.
 * The page contains: streamController.enqueue("<JSON string>");
 * The argument is a JS string literal whose content is a JSON array.
 */
function extractTurboStreamArray(html) {
  const marker = 'streamController.enqueue(';
  const start = html.indexOf(marker);
  if (start === -1) return null;

  const from = start + marker.length;
  const scriptEnd = html.indexOf('</script>', from);
  if (scriptEnd === -1) return null;

  let literal = html.substring(from, scriptEnd).trim();
  if (literal.endsWith(');')) literal = literal.slice(0, -2).trim();
  if (!literal.startsWith('"')) return null;

  let decoded;
  try {
    decoded = JSON.parse(literal); // unescape the JS string literal
  } catch {
    return null;
  }
  try {
    return JSON.parse(decoded); // the actual turbo-stream array
  } catch {
    return null;
  }
}

/**
 * Hydrate the flat turbo-stream array into a nested plain object.
 *
 * Encoding rules observed in the wild:
 *  - Object keys are `_N` where arr[N] holds the key-name string.
 *  - Object values are numbers indexing into arr (strings, numbers, or
 *    nested objects all live in the array).
 *  - Array elements are indices into arr too.
 *  - Some literals (null, true/false) are stored inline via special markers;
 *    we treat unknown indices leniently and keep what we can resolve.
 */
function hydrateRoot(arr) {
  const root = hydrate(arr[0], arr, 0);
  // The top-level structure is typically
  // [headerObj, "loaderData", {...}, "actionData", ...] — hydrate returns
  // the first object; we instead walk the whole array looking for the
  // pieces we care about. Build a lookup of key-name -> value across all
  // objects at depth 1 and 2.

  const result = {};

  // serverResponse / pageTitle / errors live inside the loaderData region.
  const keyIdx = (name) => arr.findIndex((v) => v === name);

  const pageTitleIdx = keyIdx('pageTitle');
  const serverResponseIdx = keyIdx('serverResponse');
  const linearIdx = keyIdx('linear_conversation');
  const titleIdx = keyIdx('title');

  // Any object holding `_pageTitle` gives us the displayed title.
  const objWith = (kIdx) => {
    if (kIdx === -1) return null;
    const key = '_' + kIdx;
    for (let i = 0; i < arr.length; i++) {
      const v = arr[i];
      if (v && typeof v === 'object' && !Array.isArray(v) && key in v) return v;
    }
    return null;
  };

  const titleHolder = objWith(pageTitleIdx) || objWith(titleIdx);
  if (titleHolder) {
    const raw = resolveValue(titleHolder['_' + (pageTitleIdx !== -1 ? pageTitleIdx : titleIdx)], arr);
    if (typeof raw === 'string' && raw.length > 0 && raw.length < 300) {
      result.pageTitle = raw;
    }
  }

  // serverResponse object: {type: "data", data: {title, linear_conversation, ...}}
  if (serverResponseIdx !== -1) {
    const holder = objWith(serverResponseIdx);
    if (holder) {
      const serverResponse = resolveValue(holder['_' + serverResponseIdx], arr);
      if (serverResponse && typeof serverResponse === 'object') {
        // Deleted chats come back as {type: "error", error: "..."}.
        if (serverResponse.error && typeof serverResponse.error === 'string') {
          result.error = serverResponse.error;
        } else if (serverResponse.data && typeof serverResponse.data === 'object') {
          result.serverResponse = serverResponse.data;
          return result;
        } else {
          result.serverResponse = serverResponse;
          return result;
        }
      }
    }
  }

  // Fallback: find the linear_conversation array directly.
  if (linearIdx !== -1) {
    const holder = objWith(linearIdx);
    if (holder) {
      const nodes = resolveValue(holder['_' + linearIdx], arr);
      if (Array.isArray(nodes)) {
        result.serverResponse = { linear_conversation: nodes };
        if (result.pageTitle) result.serverResponse.title = result.pageTitle;
        return result;
      }
    }
  }

  return result;
}

/**
 * Recursively resolve a turbo-stream reference into plain JS values.
 * `ref` may be: a number (index into arr), a string (literal), an object
 * ({_N: idx,...}), or an array (of indices/refs).
 */
function resolveValue(ref, arr, depth = 0) {
  if (depth > 15 || ref === null || ref === undefined) return ref;

  if (typeof ref === 'number') {
    const target = arr[ref];
    if (target === undefined) return ref; // a literal number, not an index
    return resolveValue(target, arr, depth + 1);
  }

  if (Array.isArray(ref)) {
    return ref.map((item) => resolveValue(item, arr, depth + 1));
  }

  if (typeof ref === 'object') {
    const out = {};
    for (const k of Object.keys(ref)) {
      const keyIdx = parseInt(k.substring(1), 10);
      const keyName =
        Number.isFinite(keyIdx) && typeof arr[keyIdx] === 'string' ? arr[keyIdx] : k;
      out[keyName] = resolveValue(ref[k], arr, depth + 1);
    }
    return out;
  }

  return ref; // string or boolean literal
}

/**
 * Hydrate a single reference (kept for clarity; resolveValue does the work).
 */
function hydrate(ref, arr, depth) {
  return resolveValue(ref, arr, depth);
}

/**
 * Find the user-facing error message in a hydrated share payload, e.g.
 * "Conversation has been deleted. Start a new chat."
 */
function findError(hydrated) {
  return hydrated.error || null;
}
