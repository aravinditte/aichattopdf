# AIChat to PDF

Convert public **ChatGPT** and **Gemini** share links into clean, beautifully formatted **PDF** files — for free, with no login and no browser extension.

**Try it: [aichattopdf.netlify.com](https://aichattopdf.netlify.com)**

## What it does

Paste a public share link from ChatGPT or Gemini, hit Generate, and the full conversation opens as a print-ready PDF — with code syntax highlighting, tables, lists, and equations preserved in a clean A4 layout. The PDF is rendered entirely in your browser; nothing is stored on any server.

## Supported links

| Platform | Link format |
|---|---|
| ChatGPT | `https://chatgpt.com/share/<id>` |
| Gemini | `https://gemini.google.com/share/<id>` |

The conversation must be publicly shared — private chats can't be fetched.

## How it works

1. **Share** your conversation in ChatGPT or Gemini and copy the public link.
2. **Paste** the link at [aichattopdf.netlify.com](https://aichattopdf.netlify.com).
3. **Generate** — your browser's print dialog opens with the formatted conversation. Save as PDF.

## Tech stack

- [Next.js](https://nextjs.org) (App Router) — server-side fetching and rendering
- `marked` + `highlight.js` — markdown rendering with syntax-highlighted code blocks
- `DOMPurify` — every conversation is sanitized before rendering
- Zero storage: conversations are fetched on demand and never persisted

## Development

```bash
npm install
npm run dev    # http://localhost:3000
npm run build  # production build
```

## License

MIT
