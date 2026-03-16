import { Injectable, OnModuleDestroy } from '@nestjs/common';

export const DEFAULT_CACHE_TTL = 3600; // 1 hour in seconds

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

@Injectable()
export class CacheService implements OnModuleDestroy {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Run cleanup every 60 seconds to remove expired entries
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);

    console.log('✅ In-memory cache initialized');
  }

  onModuleDestroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cache.clear();
  }

  /**
   * Get value from cache
   * @param key Cache key
   * @returns Parsed value or null
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const entry = this.cache.get(key);
      if (!entry) return null;

      // Check if expired
      if (Date.now() > entry.expiresAt) {
        this.cache.delete(key);
        return null;
      }

      return entry.value as T;
    } catch (error) {
      console.error(`Error getting cache key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set value in cache with TTL
   * @param key Cache key
   * @param value Value to cache
   * @param ttl Time to live in seconds (default: 1 hour)
   */
  async set<T>(
    key: string,
    value: T,
    ttl: number = DEFAULT_CACHE_TTL,
  ): Promise<void> {
    try {
      const expiresAt = Date.now() + ttl * 1000;
      this.cache.set(key, { value, expiresAt });
    } catch (error) {
      console.error(`Error setting cache key ${key}:`, error);
    }
  }

  /**
   * Delete key from cache
   * @param key Cache key
   */
  async del(key: string): Promise<void> {
    try {
      this.cache.delete(key);
    } catch (error) {
      console.error(`Error deleting cache key ${key}:`, error);
    }
  }

  /**
   * Delete multiple keys from cache
   * @param keys Array of cache keys
   */
  async delMany(keys: string[]): Promise<void> {
    try {
      for (const key of keys) {
        this.cache.delete(key);
      }
    } catch (error) {
      console.error(`Error deleting multiple cache keys:`, error);
    }
  }

  /**
   * Check if key exists in cache
   * @param key Cache key
   * @returns Boolean
   */
  async exists(key: string): Promise<boolean> {
    try {
      const entry = this.cache.get(key);
      if (!entry) return false;

      // Check if expired
      if (Date.now() > entry.expiresAt) {
        this.cache.delete(key);
        return false;
      }

      return true;
    } catch (error) {
      console.error(`Error checking cache key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get all keys matching a pattern
   * @param pattern Pattern to match (e.g., "user:*")
   * @returns Array of matching keys
   */
  async keys(pattern: string): Promise<string[]> {
    try {
      const regex = new RegExp(
        '^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$',
      );
      const matchingKeys: string[] = [];

      for (const key of this.cache.keys()) {
        if (regex.test(key)) {
          const entry = this.cache.get(key);
          // Only include non-expired keys
          if (entry && Date.now() <= entry.expiresAt) {
            matchingKeys.push(key);
          }
        }
      }

      return matchingKeys;
    } catch (error) {
      console.error(`Error getting keys for pattern ${pattern}:`, error);
      return [];
    }
  }

  /**
   * Clear all keys matching a pattern
   * @param pattern Pattern to match
   */
  async clearPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.keys(pattern);
      await this.delMany(keys);
    } catch (error) {
      console.error(`Error clearing pattern ${pattern}:`, error);
    }
  }

  /**
   * Get TTL for a key
   * @param key Cache key
   * @returns TTL in seconds or -1 if no expiry, -2 if key doesn't exist
   */
  async ttl(key: string): Promise<number> {
    try {
      const entry = this.cache.get(key);
      if (!entry) return -2;

      const ttlMs = entry.expiresAt - Date.now();
      if (ttlMs <= 0) {
        this.cache.delete(key);
        return -2;
      }

      return Math.ceil(ttlMs / 1000);
    } catch (error) {
      console.error(`Error getting TTL for key ${key}:`, error);
      return -2;
    }
  }

  /**
   * Refresh TTL for a key
   * @param key Cache key
   * @param ttl New TTL in seconds
   */
  async expire(key: string, ttl: number): Promise<void> {
    try {
      const entry = this.cache.get(key);
      if (entry) {
        entry.expiresAt = Date.now() + ttl * 1000;
      }
    } catch (error) {
      console.error(`Error setting expiry for key ${key}:`, error);
    }
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}
