import { marked } from 'marked';
import hljs from 'highlight.js';

// Configure marked to use highlight.js
marked.setOptions({
  highlight: function (code, lang) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    return hljs.highlight(code, { language }).value;
  },
  langPrefix: 'hljs language-',
});

/**
 * Converts a normalized conversation into a complete HTML document optimized for printing
 * @param {Object} conversation 
 * @returns {string} HTML string
 */
export function renderConversationHtml(conversation) {
  const { title, platform, url, messages } = conversation;
  
  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  const platformName = platform === 'chatgpt' ? 'ChatGPT' : 'Gemini';

  let messagesHtml = '';
  
  for (const msg of messages) {
    const isUser = msg.role === 'user';
    const label = isUser ? 'You' : platformName;
    const contentHtml = marked.parse(msg.content);
    
    messagesHtml += `
      <div class="message ${isUser ? 'user-message' : 'assistant-message'}">
        <div class="message-header">
          <span class="message-label">${label}</span>
        </div>
        <div class="message-content">
          ${contentHtml}
        </div>
      </div>
    `;
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - ${platformName}</title>
  <style>
    :root {
      --bg-color: #ffffff;
      --text-color: #334155;
      --code-bg: #1e293b;
      --code-text: #f8fafc;
      --user-border: #0ea5e9;
      --border-color: #e2e8f0;
    }
    
    * {
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: var(--text-color);
      background-color: var(--bg-color);
      margin: 0;
      padding: 0;
    }

    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }

    .cover-page {
      text-align: center;
      padding: 4rem 2rem;
      border-bottom: 2px solid var(--border-color);
      margin-bottom: 2rem;
      page-break-after: always;
    }

    .cover-title {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 1rem;
      color: #0f172a;
    }

    .cover-meta {
      font-size: 1.1rem;
      color: #64748b;
      margin-bottom: 0.5rem;
    }
    
    .platform-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      background-color: #f1f5f9;
      font-weight: 600;
      font-size: 0.875rem;
      margin-bottom: 2rem;
    }

    .message {
      margin-bottom: 2rem;
      padding: 1.5rem;
      border-radius: 0.5rem;
      page-break-inside: avoid;
    }

    .user-message {
      border-left: 4px solid var(--user-border);
      background-color: #f8fafc;
    }

    .assistant-message {
      background-color: #ffffff;
      border: 1px solid var(--border-color);
    }

    .message-header {
      font-weight: 700;
      margin-bottom: 1rem;
      font-size: 1.1rem;
      color: #0f172a;
    }

    .message-content {
      overflow-wrap: break-word;
    }

    .message-content p {
      margin-top: 0;
      margin-bottom: 1rem;
    }

    .message-content p:last-child {
      margin-bottom: 0;
    }

    pre {
      background-color: var(--code-bg);
      color: var(--code-text);
      padding: 1rem;
      border-radius: 0.5rem;
      overflow-x: auto;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      font-size: 0.875rem;
      page-break-inside: avoid;
    }

    code {
      font-family: inherit;
      background-color: #f1f5f9;
      color: #0f172a;
      padding: 0.125rem 0.25rem;
      border-radius: 0.25rem;
    }

    pre code {
      background-color: transparent;
      padding: 0;
      color: inherit;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 1rem;
      page-break-inside: avoid;
    }

    th, td {
      border: 1px solid var(--border-color);
      padding: 0.75rem;
      text-align: left;
    }

    th {
      background-color: #f8fafc;
      font-weight: 600;
    }
    
    tr:nth-child(even) {
      background-color: #f8fafc;
    }

    blockquote {
      border-left: 4px solid #cbd5e1;
      margin: 0 0 1rem 0;
      padding-left: 1rem;
      color: #64748b;
      font-style: italic;
    }

    a {
      color: #2563eb;
      text-decoration: none;
    }

    .footer {
      text-align: center;
      margin-top: 4rem;
      padding-top: 2rem;
      border-top: 1px solid var(--border-color);
      font-size: 0.875rem;
      color: #94a3b8;
    }

    @media print {
      @page {
        size: A4;
        margin: 2cm;
      }
      
      body {
        background-color: white;
      }
      
      .container {
        padding: 0;
        max-width: none;
      }

      a {
        text-decoration: none !important;
      }
      
      .cover-page {
        border-bottom: none;
      }
      
      pre, blockquote, table, img, .message {
        page-break-inside: avoid;
      }
      
      h1, h2, h3, h4, h5, h6 {
        page-break-after: avoid;
      }
    }
    
    /* Basic syntax highlighting colors for highlight.js */
    .hljs-keyword { color: #c678dd; }
    .hljs-string { color: #98c379; }
    .hljs-number { color: #d19a66; }
    .hljs-built_in { color: #e5c07b; }
    .hljs-comment { color: #5c6370; font-style: italic; }
    .hljs-function .hljs-title { color: #61afef; }
    .hljs-title.class_ { color: #e5c07b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="cover-page">
      <div class="platform-badge">${platformName}</div>
      <h1 class="cover-title">${title}</h1>
      <div class="cover-meta">Generated on ${dateStr}</div>
      <div class="cover-meta">Messages: ${messages.length}</div>
      <div class="cover-meta">
        <a href="${url}" target="_blank">${url}</a>
      </div>
    </div>
    
    <div class="messages">
      ${messagesHtml}
    </div>
    
    <div class="footer">
      Generated by AIChat to PDF
    </div>
  </div>
</body>
</html>`;

  return html;
}
