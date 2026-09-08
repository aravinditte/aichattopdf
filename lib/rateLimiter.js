/**
 * Simple in-memory sliding window rate limiter
 */

const rateLimits = new Map();

export function checkRateLimit(ip, limit = 10, windowMs = 60000) {
  const now = Date.now();
  
  if (!rateLimits.has(ip)) {
    rateLimits.set(ip, []);
  }

  const timestamps = rateLimits.get(ip);
  
  // Clean up expired entries
  while (timestamps.length > 0 && timestamps[0] <= now - windowMs) {
    timestamps.shift();
  }

  if (timestamps.length >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: timestamps[0] + windowMs - now
    };
  }

  timestamps.push(now);
  
  return {
    allowed: true,
    remaining: limit - timestamps.length,
    resetIn: windowMs
  };
}
