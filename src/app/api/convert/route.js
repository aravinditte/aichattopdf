import { NextResponse } from 'next/server';
import { validateUrl, isSafeUrl } from '@/lib/validator';
import { checkRateLimit } from '@/lib/rateLimiter';
import { parseChatGPT } from '@/lib/parsers/chatgpt';
import { parseGemini } from '@/lib/parsers/gemini';
import { renderConversationHtml } from '@/lib/renderer';

export async function POST(request) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: 'Missing URL' }, { status: 400 });
    }

    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    const rateLimit = checkRateLimit(ip);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' }, 
        { 
          status: 429, 
          headers: {
            'Retry-After': rateLimit.resetInSeconds.toString()
          }
        }
      );
    }

    // URL Validation
    const validation = validateUrl(url);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // SSRF Check
    const isSafe = await isSafeUrl(url);
    if (!isSafe) {
      return NextResponse.json({ error: 'Unsafe URL detected' }, { status: 400 });
    }

    // Dispatch to parser
    let conversation;
    try {
      if (validation.platform === 'chatgpt') {
        conversation = await parseChatGPT(validation.shareId);
      } else if (validation.platform === 'gemini') {
        conversation = await parseGemini(validation.shareId);
      }
    } catch (parseError) {
      const message = parseError.message || 'Failed to fetch conversation';
      if (message.includes('not found')) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
      }
      if (message.includes('Rate limited')) {
        return NextResponse.json({ error: message }, { status: 429 });
      }
      console.error('Parse error:', parseError);
      return NextResponse.json({ error: 'Failed to fetch from source platform' }, { status: 502 });
    }

    // Render HTML
    const html = renderConversationHtml(conversation);

    // Logging metadata
    console.log(`[CONVERT] IP: ${ip}, Platform: ${validation.platform}, Messages: ${conversation.messages.length}`);

    // Return successful response
    return NextResponse.json({
      title: conversation.title,
      html,
      messageCount: conversation.messages.length,
      platform: validation.platform
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Internal server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
