import dns from 'dns';

/**
 * Checks if an IP address is private/internal
 * @param {string} ip 
 * @returns {boolean}
 */
function isIpPrivate(ip) {
  const ipv4Pattern = /^(10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|127\.\d{1,3}\.\d{1,3}\.\d{1,3}|0\.0\.0\.0|169\.254\.\d{1,3}\.\d{1,3})$/;
  const ipv6Pattern = /^(::1)$/;
  return ipv4Pattern.test(ip) || ipv6Pattern.test(ip);
}

/**
 * SSRF protection: validates that a URL resolves to a public IP
 * @param {string} urlString 
 * @returns {Promise<boolean>}
 */
export async function isSafeUrl(urlString) {
  try {
    const url = new URL(urlString);
    
    if (!['http:', 'https:'].includes(url.protocol)) {
      return false;
    }
    
    const hostname = url.hostname;
    
    if (isIpPrivate(hostname)) {
      return false;
    }
    
    try {
      const { address } = await dns.promises.lookup(hostname);
      if (isIpPrivate(address)) {
        return false;
      }
    } catch (dnsError) {
      return false;
    }
    
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Validates a share URL and extracts platform and shareId
 * @param {string} urlString 
 * @returns {{ valid: boolean, platform: 'chatgpt'|'gemini'|null, shareId: string|null, error: string|null }}
 */
export function validateUrl(urlString) {
  try {
    const url = new URL(urlString);
    
    if (url.protocol !== 'https:') {
      return { valid: false, platform: null, shareId: null, error: 'Must use https:// protocol' };
    }
    
    const host = url.hostname;
    const path = url.pathname;
    
    if (host === 'chatgpt.com' || host === 'chat.openai.com') {
      const match = path.match(/^\/share\/([a-zA-Z0-9-]+)\/?$/);
      if (match) {
        return { valid: true, platform: 'chatgpt', shareId: match[1], error: null };
      }
    } else if (host === 'share.gemini.google') {
      const match = path.match(/^\/([a-zA-Z0-9-]+)\/?$/);
      if (match) {
        return { valid: true, platform: 'gemini', shareId: match[1], error: null };
      }
    }
    
    return { valid: false, platform: null, shareId: null, error: 'Invalid or unsupported URL format' };
  } catch (e) {
    return { valid: false, platform: null, shareId: null, error: 'Invalid URL' };
  }
}
