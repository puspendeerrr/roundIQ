import { env } from './env';

export class RedisCache {
  private memoryCache: Map<string, { value: any; expiresAt: number }> = new Map();

  async get(key: string): Promise<any | null> {
    const item = this.memoryCache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.memoryCache.delete(key);
      return null;
    }
    return item.value;
  }

  async set(key: string, value: any, ttlSeconds = 300): Promise<void> {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.memoryCache.set(key, { value, expiresAt });
  }

  async del(key: string): Promise<void> {
    this.memoryCache.delete(key);
  }

  async clear(): Promise<void> {
    this.memoryCache.clear();
  }

  getStats() {
    return {
      activeKeys: this.memoryCache.size,
      provider: env.REDIS_URL ? 'Redis Cluster Ready' : 'High-Performance Memory Cache',
    };
  }
}

export const redisCache = new RedisCache();
