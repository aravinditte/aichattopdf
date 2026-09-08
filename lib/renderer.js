import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';
import DOMPurify from 'isomorphic-dompurify';

/**
 * Creates a configured Marked instance with syntax highlighting.
 */
function createMarkedInstance() {
  const marked = new Marked(
    markedHighlight({
      langPrefix: 'hljs language-',
      highlight(code, lang) {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext';
        return hljs.highlight(code, { language }).value;
      }
    })
  );

  marked.setOptions({
    gfm: true,
    breaks: true,
  });

  return marked;
}

/**
 * Converts a normalized conversation model to a self-contained HTML document
 * optimized for printing as a PDF.
 */
export function renderConversationHTML(conversation) {
  const { title, platform, messages } = conversation;
  const marked = createMarkedInstance();
  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  let messagesHtml = '';

  for (const msg of messages) {
    const isUser = msg.role === 'user';
    const authorName = isUser ? 'You' : (platform === 'chatgpt' ? 'ChatGPT' : 'Gemini');
    const rawHtml = marked.parse(msg.content || '');
    // Message content is third-party text from a share link — sanitize before
    // embedding it in the printable document (blocks <script>, inline event
    // handlers, javascript: URLs, etc. while keeping normal markdown output).
    const contentHtml = DOMPurify.sanitize(rawHtml, {
      FORBID_TAGS: ['style', 'form', 'input', 'button', 'iframe', 'object', 'embed'],
      FORBID_ATTR: ['style'],
    });
    const messageClass = isUser ? 'message-user' : 'message-assistant';
    const authorIcon = isUser ? '👤' : (platform === 'chatgpt' ? '🤖' : '✦');

    messagesHtml += `
      <div class="message ${messageClass}">
        <div class="message-author"><span class="author-icon">${authorIcon}</span> ${authorName}</div>
        <div class="message-content">${contentHtml}</div>
      </div>
    `;
  }

  const platformLabel = platform === 'chatgpt' ? 'ChatGPT' : 'Gemini';
  const platformColor = platform === 'chatgpt' ? '#10a37f' : '#4285f4';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>
    @page {
      size: A4;
      margin: 18mm 15mm;
      @bottom-center {
        content: "Page " counter(page) " of " counter(pages);
        font-size: 8pt;
        color: #94a3b8;
      }
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 10.5pt;
      line-height: 1.65;
      color: #1e293b;
      background: #fff;
      padding: 0;
    }

    /* ─── Header ─── */
    .doc-header {
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 12px;
      margin-bottom: 24px;
    }

    .doc-header h1 {
      font-size: 16pt;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 6px 0;
      line-height: 1.25;
    }

    .doc-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 8.5pt;
      color: #64748b;
    }

    .platform-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-weight: 600;
      font-size: 8pt;
      color: #fff;
      background-color: ${platformColor};
    }

    /* ─── Messages ─── */
    .conversation {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .message {
      padding: 14px 16px;
      border-radius: 6px;
      page-break-inside: avoid;
    }

    .message-user {
      background-color: #fffbeb;
      border-left: 3px solid #f59e0b;
    }

    .message-assistant {
      background-color: #f8fafc;
      border-left: 3px solid ${platformColor};
      border: 1px solid #e2e8f0;
      border-left: 3px solid ${platformColor};
    }

    .message-author {
      font-weight: 700;
      font-size: 9pt;
      color: #475569;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .author-icon {
      font-style: normal;
      margin-right: 2px;
    }

    .message-content {
      overflow-wrap: break-word;
      word-wrap: break-word;
    }

    .message-content > *:first-child {
      margin-top: 0;
    }

    .message-content > *:last-child {
      margin-bottom: 0;
    }

    /* ─── Typography ─── */
    .message-content p {
      margin-bottom: 10px;
    }

    .message-content h1 {
      font-size: 15pt;
      font-weight: 700;
      margin: 20px 0 8px 0;
      color: #0f172a;
      page-break-after: avoid;
    }

    .message-content h2 {
      font-size: 13pt;
      font-weight: 700;
      margin: 18px 0 6px 0;
      color: #0f172a;
      page-break-after: avoid;
    }

    .message-content h3 {
      font-size: 11.5pt;
      font-weight: 600;
      margin: 14px 0 4px 0;
      color: #1e293b;
      page-break-after: avoid;
    }

    .message-content h4, .message-content h5, .message-content h6 {
      font-size: 10.5pt;
      font-weight: 600;
      margin: 12px 0 4px 0;
      color: #334155;
      page-break-after: avoid;
    }

    /* ─── Code ─── */
    pre {
      background-color: #1e293b;
      color: #e2e8f0;
      font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      font-size: 8.5pt;
      line-height: 1.5;
      padding: 12px 14px;
      border-radius: 6px;
      overflow-x: hidden;
      white-space: pre-wrap;
      word-wrap: break-word;
      page-break-inside: avoid;
      margin-bottom: 12px;
    }

    code {
      font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      background-color: #f1f5f9;
      padding: 1px 5px;
      border-radius: 3px;
      font-size: 9pt;
      color: #0f172a;
    }

    pre code {
      background-color: transparent;
      padding: 0;
      color: inherit;
      font-size: inherit;
    }

    /* ─── Tables ─── */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0;
      page-break-inside: avoid;
      font-size: 9.5pt;
    }

    th, td {
      border: 1px solid #cbd5e1;
      padding: 7px 10px;
      text-align: left;
    }

    th {
      background-color: #0f172a;
      color: #f8fafc;
      font-weight: 600;
      font-size: 9pt;
    }

    tr:nth-child(even) {
      background-color: #f8fafc;
    }

    /* ─── Lists ─── */
    ul, ol {
      padding-left: 22px;
      margin-bottom: 10px;
    }

    li {
      margin-bottom: 3px;
    }

    li > ul, li > ol {
      margin-top: 3px;
      margin-bottom: 3px;
    }

    /* ─── Blockquotes ─── */
    blockquote {
      border-left: 3px solid #cbd5e1;
      margin: 0 0 12px 0;
      padding: 4px 14px;
      font-style: italic;
      color: #64748b;
    }

    blockquote p {
      margin-bottom: 4px;
    }

    /* ─── Links ─── */
    a {
      color: #0ea5e9;
      text-decoration: underline;
    }

    /* ─── Horizontal Rules ─── */
    hr {
      border: none;
      border-top: 1px solid #e2e8f0;
      margin: 16px 0;
    }

    /* ─── Images ─── */
    img {
      max-width: 100%;
      height: auto;
    }

    /* ─── Syntax Highlighting (One Dark inspired) ─── */
    .hljs-keyword, .hljs-selector-tag { color: #c678dd; }
    .hljs-string, .hljs-attr { color: #98c379; }
    .hljs-number, .hljs-literal { color: #d19a66; }
    .hljs-title, .hljs-title\\.class_, .hljs-title\\.function_ { color: #61afef; }
    .hljs-comment, .hljs-quote { color: #5c6370; font-style: italic; }
    .hljs-built_in, .hljs-type { color: #e5c07b; }
    .hljs-variable, .hljs-template-variable { color: #e06c75; }
    .hljs-params { color: #abb2bf; }
    .hljs-meta { color: #61afef; }
    .hljs-tag { color: #e06c75; }
    .hljs-name { color: #e06c75; }
    .hljs-attribute { color: #d19a66; }
    .hljs-selector-class { color: #d19a66; }
    .hljs-selector-id { color: #61afef; }
    .hljs-punctuation { color: #abb2bf; }

    /* ─── Footer ─── */
    .doc-footer {
      margin-top: 30px;
      padding-top: 10px;
      border-top: 1px solid #e2e8f0;
      font-size: 8pt;
      color: #94a3b8;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="doc-header">
    <h1>${escapeHtml(title)}</h1>
    <div class="doc-meta">
      <span><span class="platform-badge">${platformLabel}</span> conversation</span>
      <span>Generated ${dateStr} by AIChat to PDF</span>
    </div>
  </div>

  <div class="conversation">
    ${messagesHtml}
  </div>

  <div class="doc-footer">
    Exported with AIChat to PDF &mdash; aichattopdf.com
  </div>
</body>
</html>`;

  return html;
}

/**
 * Escapes HTML special characters in a string.
 */
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
