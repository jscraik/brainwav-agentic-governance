/**
 * LRU Cache - Least Recently Used cache for hot data
 * Automatically evicts least recently used items when capacity is reached
 */

interface CacheNode<T> {
  value: T;
  accessCount: number;
  lastAccessed: number;
  size: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  currentSize: number;
  currentItems: number;
  hitRate: number;
}

export class LRUCache<T> {
  private cache: Map<string, CacheNode<T>>;
  private maxSize: number;
  private maxBytes: number;
  private stats: CacheStats;

  constructor(maxSize: number = 1000, maxBytes: number = 50 * 1024 * 1024) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.maxBytes = maxBytes;
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      currentSize: 0,
      currentItems: 0,
      hitRate: 0
    };
  }

  /**
   * Get item from cache
   */
  get(key: string): T | null {
    const node = this.cache.get(key);

    if (!node) {
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    // Update access metadata
    node.accessCount++;
    node.lastAccessed = Date.now();

    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, node);

    this.stats.hits++;
    this.updateHitRate();
    return node.value;
  }

  /**
   * Set item in cache
   */
  set(key: string, value: T, size: number = 1): boolean {
    // Check if value fits
    if (size > this.maxBytes) {
      return false;
    }

    // Remove existing entry if present
    if (this.cache.has(key)) {
      const existing = this.cache.get(key)!;
      this.stats.currentSize -= existing.size;
      this.stats.currentItems--;
      this.cache.delete(key);
    }

    // Evict items if necessary
    while (
      this.stats.currentItems >= this.maxSize ||
      this.stats.currentSize + size > this.maxBytes
    ) {
      this.evictLRU();
    }

    // Add new entry
    const node: CacheNode<T> = {
      value,
      accessCount: 1,
      lastAccessed: Date.now(),
      size
    };

    this.cache.set(key, node);
    this.stats.currentSize += size;
    this.stats.currentItems++;

    return true;
  }

  /**
   * Check if key exists
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * Delete item from cache
   */
  delete(key: string): boolean {
    const node = this.cache.get(key);
    if (!node) {
      return false;
    }

    this.stats.currentSize -= node.size;
    this.stats.currentItems--;
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.stats.currentSize = 0;
    this.stats.currentItems = 0;
  }

  /**
   * Evict least recently used item
   */
  private evictLRU(): void {
    const firstKey = this.cache.keys().next().value;
    if (firstKey) {
      const node = this.cache.get(firstKey)!;
      this.stats.currentSize -= node.size;
      this.stats.currentItems--;
      this.stats.evictions++;
      this.cache.delete(firstKey);
    }
  }

  /**
   * Update hit rate
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Get all keys (sorted by recency)
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get cache size info
   */
  getSize(): { items: number; bytes: number } {
    return {
      items: this.stats.currentItems,
      bytes: this.stats.currentSize
    };
  }

  /**
   * Warm cache with data
   */
  warm(entries: Map<string, { value: T; size?: number }>): void {
    for (const [key, entry] of entries) {
      this.set(key, entry.value, entry.size || 1);
    }
  }
}
