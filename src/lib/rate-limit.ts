interface RateLimitEntry {
  count: number;
  resetAt: number;
}

class RateLimitStore {
  private store = new Map<string, RateLimitEntry>();
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    // Clean expired entries every 60 seconds
    if (typeof setInterval !== "undefined") {
      this.cleanupInterval = setInterval(() => this.cleanup(), 60_000);
    }
  }

  check(key: string, maxRequests: number, windowMs: number): { allowed: boolean; retryAfter: number } {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now >= entry.resetAt) {
      this.store.set(key, { count: 1, resetAt: now + windowMs });
      return { allowed: true, retryAfter: 0 };
    }

    if (entry.count >= maxRequests) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      return { allowed: false, retryAfter };
    }

    entry.count++;
    return { allowed: true, retryAfter: 0 };
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (now >= entry.resetAt) {
        this.store.delete(key);
      }
    }
  }
}

// Singleton store
const store = new RateLimitStore();

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export function rateLimit(config: RateLimitConfig) {
  return {
    check(identifier: string) {
      return store.check(identifier, config.maxRequests, config.windowMs);
    },
  };
}

// Pre-configured limiters for different tiers
export const authLimiter = rateLimit({ maxRequests: 10, windowMs: 60_000 });
export const adLimiter = rateLimit({ maxRequests: 35, windowMs: 60_000 });
export const transactionLimiter = rateLimit({ maxRequests: 20, windowMs: 60_000 });
export const generalLimiter = rateLimit({ maxRequests: 100, windowMs: 60_000 });
