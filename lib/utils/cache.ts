interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class MemoryCache {
  private cache: Map<string, CacheItem<any>> = new Map();
  private readonly defaultTtl = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, ttl: number = this.defaultTtl): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if expired
    if (Date.now() > item.timestamp + item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.timestamp + item.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache statistics
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Global cache instance
const cache = new MemoryCache();

// Run cleanup every 10 minutes
setInterval(() => {
  cache.cleanup();
}, 10 * 60 * 1000);

// Cache key generators
export const cacheKeys = {
  customers: (page: number, limit: number, sort: string) => 
    `customers:${page}:${limit}:${sort}`,
  customer: (id: string) => `customer:${id}`,
  expenses: (page: number, limit: number, sort: string) => 
    `expenses:${page}:${limit}:${sort}`,
  expense: (id: string) => `expense:${id}`,
  leads: (page: number, limit: number, sort: string) => 
    `leads:${page}:${limit}:${sort}`,
  lead: (id: string) => `lead:${id}`,
  dashboard: (userId: string) => `dashboard:${userId}`,
  stats: (type: string, userId: string) => `stats:${type}:${userId}`,
};

// Cache TTL constants (in milliseconds)
export const cacheTtl = {
  short: 1 * 60 * 1000,      // 1 minute
  medium: 5 * 60 * 1000,     // 5 minutes
  long: 15 * 60 * 1000,      // 15 minutes
  veryLong: 60 * 60 * 1000,  // 1 hour
};

// Main cache functions
export const memoryCache = {
  get: <T>(key: string): T | null => cache.get<T>(key),
  set: <T>(key: string, data: T, ttl?: number): void => cache.set(key, data, ttl),
  delete: (key: string): void => cache.delete(key),
  clear: (): void => cache.clear(),
  getStats: () => cache.getStats(),
};

// Cache invalidation patterns
export const cacheInvalidation = {
  invalidateCustomerCache: (customerId?: string) => {
    if (customerId) {
      memoryCache.delete(cacheKeys.customer(customerId));
    }
    // Invalidate all customer list caches
    const stats = memoryCache.getStats();
    stats.keys.forEach(key => {
      if (key.startsWith('customers:')) {
        memoryCache.delete(key);
      }
    });
  },
  
  invalidateExpenseCache: (expenseId?: string) => {
    if (expenseId) {
      memoryCache.delete(cacheKeys.expense(expenseId));
    }
    // Invalidate all expense list caches
    const stats = memoryCache.getStats();
    stats.keys.forEach(key => {
      if (key.startsWith('expenses:')) {
        memoryCache.delete(key);
      }
    });
  },
  
  invalidateLeadCache: (leadId?: string) => {
    if (leadId) {
      memoryCache.delete(cacheKeys.lead(leadId));
    }
    // Invalidate all lead list caches
    const stats = memoryCache.getStats();
    stats.keys.forEach(key => {
      if (key.startsWith('leads:')) {
        memoryCache.delete(key);
      }
    });
  },
  
  invalidateStatsCache: (userId: string) => {
    const stats = memoryCache.getStats();
    stats.keys.forEach(key => {
      if (key.startsWith('stats:') && key.includes(userId)) {
        memoryCache.delete(key);
      }
    });
  },
};

// Wrapper for async operations with cache
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = cacheTtl.medium
): Promise<T> {
  // Try to get from cache first
  const cached = memoryCache.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  // If not in cache, fetch and cache
  const data = await fetcher();
  memoryCache.set(key, data, ttl);
  return data;
}