/**
 * Gemini shared conversation parser.
 *
 * Gemini share pages (https://gemini.google.com/share/<id>) are
 * client-rendered: the initial HTML contains only landing-page demo content
 * (WIZ_global_data keys like DnVkpd / GtQXDc / yVlrc), never the shared
 * conversation. The page fetches it over the internal batchexecute RPC:
 *
 *   POST https://gemini.google.com/_/BardChatUi/data/batchexecute?rpcids=ujx1Bf
 *   body: f.req=[[["ujx1Bf","[null,\"<shareId>\"]",null,"generic"]]]
 *
 * (rpc id `ujx1Bf` = /BardFrontendService.GetSharedConversation, confirmed by
 * name in Gemini's own BardChatUi bundle.)
 *
 * The response (after the `)]}'` XSSI prefix) is a batchexecute envelope whose
 * `wrb.fr`/`ujx1Bf` frame carries a JSON-serialized proto. Decoded by
 * position (verified against a live share's payload, and cross-checked with
 * the bundle's class definitions — ngd/mgd/lgd/rcd accessors):
 *
 *   proto[0]                wrapper
 *     .[1]                  ngd[] — one entry per user turn
 *        [0]                [conversationId, responseId] ids
 *        [2]  (lgd)         [0] = [userPromptText]  (field 1 -> rJ.getText)
 *        [3]  (mgd)         response proto
 *           [0]  (rcd[])    candidates; [0] = id, [1] = [markdownText]
 *                          (field 2 = a list whose first item is the full
 *                           markdown answer — the same text Gemini renders)
 *     .[2]                  metadata; [1] = conversation title (field 2)
 *
 * A missing/empty frame payload means "no such conversation" (404).
 */

const RPC_URL = 'https://gemini.google.com/_/BardChatUi/data/batchexecute';
const FETCH_TIMEOUT_MS = 20000;
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

export async function parseGemini(shareId) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const inner = JSON.stringify([null, shareId]);
    const fReq = JSON.stringify([[['ujx1Bf', inner, null, 'generic']]]);
    const sourcePath = encodeURIComponent(`/share/${shareId}`);

    const res = await fetch(`${RPC_URL}?rpcids=ujx1Bf&source-path=${sourcePath}`, {
      method: 'POST',
      headers: {
        'User-Agent': USER_AGENT,
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        Accept: '*/*',
        Origin: 'https://gemini.google.com',
        Referer: `https://gemini.google.com/share/${shareId}`,
      },
      body: `f.req=${encodeURIComponent(fReq)}`,
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
      throw Object.assign(new Error(`Gemini returned ${res.status}`), { statusCode: 502 });
    }

    const raw = await res.text();
    return extractFromRpcResponse(raw, shareId);
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
 * Decode a batchexecute response body into a normalized conversation.
 * Exported for tests against saved snapshots.
 */
export function extractFromRpcResponse(raw, shareId) {
  // Strip the XSSI-protection prefix and any leading blank lines.
  let json = raw.trim();
  if (json.startsWith(")]}'")) {
    json = json.slice(4).trim();
  }

  let envelope;
  try {
    envelope = JSON.parse(json);
  } catch {
    throw Object.assign(new Error("Couldn't parse Gemini's response."), { statusCode: 502 });
  }

  // Find the wrb.fr payload for our rpc id. The envelope is a list of
  // batchexecute "sections": [[frame, sectionMeta], ...] — frames may sit at
  // the top level or nested one level down, so scan both.
  let payload = null;
  const isUjxFrame = (arr) =>
    Array.isArray(arr) && arr[0] === 'wrb.fr' && arr[1] === 'ujx1Bf';

  for (const section of envelope) {
    if (isUjxFrame(section)) {
      payload = section[2];
      break;
    }
    if (Array.isArray(section)) {
      const inner = section.find(isUjxFrame);
      if (inner) {
        payload = inner[2];
        break;
      }
    }
  }

  // batchexecute returns [null,...] with an error marker when the request
  // proto doesn't deserialize or the share id is unknown; an empty payload
  // means "no such conversation".
  if (payload === null || payload === undefined) {
    throw Object.assign(new Error('Conversation not found or no longer available.'), {
      statusCode: 404,
    });
  }

  const proto = typeof payload === 'string' ? JSON.parse(payload) : payload;
  return normalizeConversation(proto, shareId);
}

/**
 * Map the deserialized GetSharedConversation proto to {title, messages}.
 * Shape verified against live payloads:
 *   proto[0]   wrapper: [null?, turns[], meta[], ...]
 *   turns      ngd[]: turn[2] = lgd (user), turn[3] = mgd (response)
 *   meta[1]    conversation title
 */
function normalizeConversation(proto, shareId) {
  const wrapper = Array.isArray(proto) && Array.isArray(proto[0]) ? proto[0] : null;
  if (!wrapper) {
    throw Object.assign(new Error('Unexpected Gemini response shape.'), { statusCode: 502 });
  }

  // Title: wrapper field 3 (index 2) is a metadata array; field 2 = title.
  let title = null;
  const meta = Array.isArray(wrapper[2]) ? wrapper[2] : null;
  if (meta && typeof meta[1] === 'string' && meta[1].length > 0) {
    title = meta[1];
  }

  // Turns: wrapper field 2 (index 1).
  const turns = Array.isArray(wrapper[1]) ? wrapper[1] : null;
  if (!turns || turns.length === 0) {
    throw Object.assign(
      new Error('No readable messages were found in this conversation.'),
      { statusCode: 422 }
    );
  }

  const messages = [];
  for (const turn of turns) {
    if (!Array.isArray(turn)) continue;

    // ngd: lgd (user input) at index 2, mgd (response) at index 3.
    const lgd = Array.isArray(turn[2]) ? turn[2] : null;
    const mgd = Array.isArray(turn[3]) ? turn[3] : null;

    const userText = readUserText(lgd);
    if (userText) {
      messages.push({ role: 'user', content: userText });
    }

    const assistantText = readAssistantText(mgd);
    if (assistantText) {
      messages.push({ role: 'assistant', content: assistantText });
    }
  }

  if (messages.length === 0) {
    throw Object.assign(
      new Error('No readable messages were found in this conversation.'),
      { statusCode: 422 }
    );
  }

  return {
    title: title || 'Gemini Conversation',
    platform: 'gemini',
    sourceUrl: `https://gemini.google.com/share/${shareId}`,
    messages,
  };
}

/**
 * Extract the user prompt string from an lgd wrapper.
 * Live shape: lgd[0] = [userText] (rJ at field 1, text at field 1).
 */
function readUserText(lgd) {
  if (!Array.isArray(lgd)) return null;
  const rj = Array.isArray(lgd[0]) ? lgd[0] : null;
  if (!rj) return null;
  const text = typeof rj[0] === 'string' ? rj[0] : null;
  return text && text.trim() ? text.trim() : null;
}

/**
 * Extract the assistant's markdown answer from an mgd wrapper.
 * Live shape: mgd[0] = rcd[] (candidates); each rcd[1] = [markdownText].
 * Gemini's markdown is exactly what its web UI renders, so we pass it
 * through to the renderer unchanged.
 */
function readAssistantText(mgd) {
  if (!Array.isArray(mgd)) return null;

  const candidates = Array.isArray(mgd[0]) ? mgd[0] : null;
  if (candidates) {
    for (const rcd of candidates) {
      if (!Array.isArray(rcd) || !Array.isArray(rcd[1])) continue;
      const text = typeof rcd[1][0] === 'string' ? rcd[1][0] : null;
      if (text && text.trim()) return text.trim();
    }
  }

  // Fallback: some responses carry only structured content (rich tree) at
  // mgd field 13 (index 12). Walk it positionally — no string tags exist in
  // batchexecute JSON; nodes are plain arrays whose non-null cells hold
  // either nested nodes or text.
  const structured = Array.isArray(mgd[12]) ? mgd[12] : null;
  if (structured) {
    const parts = [];
    collectText(structured, parts, 0);
    const text = parts.filter((p) => p && p.trim()).join('\n\n');
    if (text.trim()) return text.trim();
  }

  return null;
}

/**
 * Depth-limited walk of a structured-content tree collecting text strings.
 * Cells that are strings are text; arrays are recursed into.
 */
function collectText(node, out, depth) {
  if (depth > 24 || !Array.isArray(node)) return;
  for (const cell of node) {
    if (typeof cell === 'string') {
      out.push(cell);
    } else if (Array.isArray(cell)) {
      collectText(cell, out, depth + 1);
    }
  }
}
