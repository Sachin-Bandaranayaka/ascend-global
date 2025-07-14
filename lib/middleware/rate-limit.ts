import { NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (req: NextRequest) => string; // Function to generate unique key
}

class RateLimiter {
  public requests: Map<string, { count: number; resetTime: number }> = new Map();
  public config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  isAllowed(key: string): { allowed: boolean; resetTime: number } {
    const now = Date.now();
    const record = this.requests.get(key);

    if (!record || now > record.resetTime) {
      // First request or window expired
      this.requests.set(key, {
        count: 1,
        resetTime: now + this.config.windowMs,
      });
      return { allowed: true, resetTime: now + this.config.windowMs };
    }

    if (record.count >= this.config.maxRequests) {
      // Rate limit exceeded
      return { allowed: false, resetTime: record.resetTime };
    }

    // Increment counter
    record.count++;
    this.requests.set(key, record);
    return { allowed: true, resetTime: record.resetTime };
  }

  cleanup() {
    const now = Date.now();
    for (const [key, record] of this.requests.entries()) {
      if (now > record.resetTime) {
        this.requests.delete(key);
      }
    }
  }
}

// Global rate limiter instances
const rateLimiters = {
  general: new RateLimiter({ windowMs: 60000, maxRequests: 100 }), // 100 requests per minute
  auth: new RateLimiter({ windowMs: 300000, maxRequests: 5 }), // 5 auth requests per 5 minutes
  sensitive: new RateLimiter({ windowMs: 60000, maxRequests: 20 }), // 20 sensitive requests per minute
};

// Cleanup old records every 5 minutes
setInterval(() => {
  Object.values(rateLimiters).forEach(limiter => limiter.cleanup());
}, 5 * 60 * 1000);

export function rateLimit(type: 'general' | 'auth' | 'sensitive' = 'general') {
  return (handler: (req: NextRequest) => Promise<NextResponse>) => {
    return async (req: NextRequest) => {
      const limiter = rateLimiters[type];
      
      // Generate key based on IP and optionally user agent
      const forwarded = req.headers.get('x-forwarded-for');
      const ip = forwarded ? forwarded.split(',')[0] : req.ip || 'unknown';
      const userAgent = req.headers.get('user-agent') || 'unknown';
      const key = `${ip}:${userAgent}`;

      const { allowed, resetTime } = limiter.isAllowed(key);

      if (!allowed) {
        const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);
        
        return NextResponse.json(
          { 
            error: 'Too many requests', 
            retryAfter: retryAfter 
          },
          { 
            status: 429,
            headers: {
              'Retry-After': retryAfter.toString(),
              'X-RateLimit-Limit': limiter.config.maxRequests.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': resetTime.toString(),
            }
          }
        );
      }

      const response = await handler(req);
      
      // Add rate limit headers to successful responses  
      const currentRecord = limiter.requests.get(key);
      const remaining = rateLimiters[type].config.maxRequests - (currentRecord?.count || 0);
      response.headers.set('X-RateLimit-Limit', rateLimiters[type].config.maxRequests.toString());
      response.headers.set('X-RateLimit-Remaining', remaining.toString());
      response.headers.set('X-RateLimit-Reset', resetTime.toString());

      return response;
    };
  };
}