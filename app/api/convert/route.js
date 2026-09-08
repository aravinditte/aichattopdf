import { validateUrl } from '../../../lib/validator.js';
import { checkRateLimit } from '../../../lib/rateLimiter.js';
import { parseChatGPT } from '../../../lib/parsers/chatgpt.js';
import { parseGemini } from '../../../lib/parsers/gemini.js';
import { renderConversationHTML } from '../../../lib/renderer.js';

export const maxDuration = 30;

export async function POST(request) {
  const startTime = Date.now();

  try {
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';

    const rateLimit = checkRateLimit(ip);
    if (!rateLimit.allowed) {
      return Response.json(
        { error: 'Rate limit exceeded' },
        { 
          status: 429, 
          headers: { 
            'Retry-After': Math.ceil(rateLimit.resetIn / 1000).toString(),
            'Access-Control-Allow-Origin': '*'
          } 
        }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return Response.json({ error: 'Invalid JSON body' }, { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    const { url } = body;
    if (!url) {
      return Response.json({ error: 'URL is required' }, { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    const validation = validateUrl(url);
    if (!validation.valid) {
      return Response.json({ error: validation.error }, { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    let conversation;
    try {
      if (validation.platform === 'chatgpt') {
        conversation = await parseChatGPT(validation.shareId);
      } else if (validation.platform === 'gemini') {
        conversation = await parseGemini(validation.shareId);
      } else {
        return Response.json({ error: 'Unsupported platform' }, { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } });
      }
    } catch (error) {
      console.error(`Parser error [${validation.platform}]:`, error);

      // Parsers attach an HTTP-mappable statusCode to their errors; use it
      // when present so not-found/private conversations surface correctly.
      const status = Number.isInteger(error.statusCode) ? error.statusCode : 502;
      let message;
      if (status === 404) {
        message = 'Conversation not found';
      } else if (status === 403) {
        message = 'Conversation is private or access denied';
      } else if (status === 504) {
        message = 'The source took too long to respond. Please try again.';
      } else if (status === 422) {
        message = error.message || 'No readable messages were found';
      } else {
        message = `Failed to fetch from ${validation.platform}`;
      }
      return Response.json(
        { error: message },
        { status, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    if (!conversation || !conversation.messages || conversation.messages.length === 0) {
      return Response.json({ error: 'No messages found in conversation' }, { status: 404, headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    const html = renderConversationHTML(conversation);
    const duration = Date.now() - startTime;
    
    // Log request metadata
    console.log(`[CONVERT] platform=${validation.platform} msgs=${conversation.messages.length} duration=${duration}ms`);

    return Response.json({
      title: conversation.title,
      html,
      messageCount: conversation.messages.length,
      platform: conversation.platform
    }, {
      status: 200,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });

  } catch (error) {
    console.error('Unhandled API error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
