import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get<T>(key: string): Promise<T | null> {
    try {
      return await this.cacheManager.get<T>(key);
    } catch (error) {
      this.logger.error(`Error getting cache key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      await this.cacheManager.set(key, value, ttl);
    } catch (error) {
      this.logger.error(`Error setting cache key ${key}:`, error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
    } catch (error) {
      this.logger.error(`Error deleting cache key ${key}:`, error);
    }
  }

  async invalidateOrgCache(orgId: string): Promise<void> {
    try {
      // Get all keys and delete those matching the org
      interface CacheStoreWithKeys extends Cache {
        store: {
          keys: (pattern: string) => Promise<string[]>;
        };
      }

      const cache = this.cacheManager as unknown as CacheStoreWithKeys;
      const keys = await cache.store.keys(`*org:${orgId}*`);
      if (keys && keys.length > 0) {
        await Promise.all(keys.map((key) => this.cacheManager.del(key)));
        this.logger.log(
          `Invalidated ${keys.length} cache keys for org ${orgId}`,
        );
      }
    } catch (error) {
      this.logger.error(`Error invalidating org cache for ${orgId}:`, error);
    }
  }

  generateTaskListKey(orgId: string, queryHash: string): string {
    return `tasks:org:${orgId}:query:${queryHash}`;
  }

  generateQueryHash(query: any): string {
    // Simple hash function for query parameters
    return Buffer.from(JSON.stringify(query))
      .toString('base64')
      .substring(0, 16);
  }
}
