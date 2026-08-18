const store = new Map();
const LIMIT = 10;
const WINDOW_S = 60;

/**
 * Simple in-memory sliding window rate limiter
 * @param {string} ip 
 * @returns {{ allowed: boolean, remaining: number, resetInSeconds: number }}
 */
export function checkRateLimit(ip) {
  const now = Date.now();
  const windowMs = WINDOW_S * 1000;
  
  if (!store.has(ip)) {
    store.set(ip, []);
  }
  
  const requests = store.get(ip);
  const validRequests = requests.filter(time => now - time < windowMs);
  
  if (validRequests.length >= LIMIT) {
    store.set(ip, validRequests);
    const oldestRequest = validRequests[0];
    const resetInSeconds = Math.ceil((oldestRequest + windowMs - now) / 1000);
    return { allowed: false, remaining: 0, resetInSeconds };
  }
  
  validRequests.push(now);
  store.set(ip, validRequests);
  
  return { 
    allowed: true, 
    remaining: LIMIT - validRequests.length,
    resetInSeconds: WINDOW_S
  };
}

// Cleanup expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  const windowMs = WINDOW_S * 1000;
  for (const [ip, requests] of store.entries()) {
    const validRequests = requests.filter(time => now - time < windowMs);
    if (validRequests.length === 0) {
      store.delete(ip);
    } else {
      store.set(ip, validRequests);
    }
  }
}, 5 * 60 * 1000);
