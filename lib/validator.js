/**
 * URL validation and SSRF protection
 */

const PRIVATE_IP_RANGES = [
  /^10\./,
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
  /^192\.168\./,
  /^127\./,
  /^0\.0\.0\.0/,
  /^169\.254\.169\.254/ // Metadata endpoint
];

export function validateUrl(urlString) {
  try {
    const url = new URL(urlString);

    if (url.protocol !== 'https:') {
      return { valid: false, platform: null, shareId: null, error: 'Only HTTPS URLs are supported' };
    }

    if (url.hostname === 'localhost') {
      return { valid: false, platform: null, shareId: null, error: 'Localhost is not supported' };
    }

    const isPrivate = PRIVATE_IP_RANGES.some(range => range.test(url.hostname));
    if (isPrivate) {
      return { valid: false, platform: null, shareId: null, error: 'Private IP addresses are not supported' };
    }

    // ChatGPT format: https://chatgpt.com/share/{uuid}
    const chatgptMatch = urlString.match(/^https:\/\/chatgpt\.com\/share\/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$/i);
    if (chatgptMatch) {
      return { valid: true, platform: 'chatgpt', shareId: chatgptMatch[1], error: null };
    }

    // Gemini format (canonical): https://gemini.google.com/share/{id}
    const geminiMatch = urlString.match(/^https:\/\/gemini\.google\.com\/share\/([a-zA-Z0-9_-]+)$/i);
    if (geminiMatch) {
      return { valid: true, platform: 'gemini', shareId: geminiMatch[1], error: null };
    }

    // Gemini format (legacy short domain): https://share.gemini.google/{id}
    const geminiShortMatch = urlString.match(/^https:\/\/share\.gemini\.google\/([a-zA-Z0-9_-]+)$/i);
    if (geminiShortMatch) {
      return { valid: true, platform: 'gemini', shareId: geminiShortMatch[1], error: null };
    }

    return { valid: false, platform: null, shareId: null, error: 'Unsupported URL format. Must be a ChatGPT or Gemini share link.' };
  } catch (err) {
    return { valid: false, platform: null, shareId: null, error: 'Invalid URL' };
  }
}
