/**
 * CacheManager - Centralized cache management for the backend
 * Integrates LRU cache with adapters for hot data
 */

import { LRUCache } from './LRUCache.js';
import type { Skill, GovernanceDocument } from '../types/index.js';

export interface CacheConfig {
  skills: {
    maxItems: number;
    maxBytes: number;
  };
  governance: {
    maxItems: number;
    maxBytes: number;
  };
  searchResults: {
    maxItems: number;
    ttl: number; // milliseconds
  };
}

export class CacheManager {
  private skillsCache: LRUCache<Skill>;
  private governanceCache: LRUCache<GovernanceDocument>;
  private searchCache: Map<string, { results: any; expires: number }>;
  private config: CacheConfig;

  constructor(config?: Partial<CacheConfig>) {
    this.config = {
      skills: {
        maxItems: 100,
        maxBytes: 10 * 1024 * 1024 // 10MB
      },
      governance: {
        maxItems: 50,
        maxBytes: 5 * 1024 * 1024 // 5MB
      },
      searchResults: {
        maxItems: 500,
        ttl: 5 * 60 * 1000 // 5 minutes
      },
      ...config
    };

    this.skillsCache = new LRUCache(
      this.config.skills.maxItems,
      this.config.skills.maxBytes
    );

    this.governanceCache = new LRUCache(
      this.config.governance.maxItems,
      this.config.governance.maxBytes
    );

    this.searchCache = new Map();
  }

  /**
   * Get skill from cache
   */
  getSkill(skillId: string): Skill | null {
    return this.skillsCache.get(skillId);
  }

  /**
   * Set skill in cache
   */
  setSkill(skillId: string, skill: Skill): boolean {
    // Estimate size based on body length
    const size = skill.body ? skill.body.length * 2 : 1000; // UTF-16
    return this.skillsCache.set(skillId, skill, size);
  }

  /**
   * Invalidate skill cache
   */
  invalidateSkill(skillId: string): void {
    this.skillsCache.delete(skillId);
  }

  /**
   * Get governance document from cache
   */
  getGovernance(docName: string): GovernanceDocument | null {
    return this.governanceCache.get(docName);
  }

  /**
   * Set governance document in cache
   */
  setGovernance(docName: string, doc: GovernanceDocument): boolean {
    const size = JSON.stringify(doc).length * 2;
    return this.governanceCache.set(docName, doc, size);
  }

  /**
   * Invalidate governance cache
   */
  invalidateGovernance(docName: string): void {
    this.governanceCache.delete(docName);
  }

  /**
   * Get search results from cache
   */
  getSearch(cacheKey: string): any | null {
    const cached = this.searchCache.get(cacheKey);
    if (!cached) {
      return null;
    }

    // Check if expired
    if (Date.now() > cached.expires) {
      this.searchCache.delete(cacheKey);
      return null;
    }

    return cached.results;
  }

  /**
   * Set search results in cache
   */
  setSearch(cacheKey: string, results: any): void {
    // Evict old entries if over limit
    if (this.searchCache.size >= this.config.searchResults.maxItems) {
      const firstKey = this.searchCache.keys().next().value;
      if (firstKey) {
        this.searchCache.delete(firstKey);
      }
    }

    this.searchCache.set(cacheKey, {
      results,
      expires: Date.now() + this.config.searchResults.ttl
    });
  }

  /**
   * Invalidate all search results
   */
  invalidateSearch(): void {
    this.searchCache.clear();
  }

  /**
   * Clear all caches
   */
  clearAll(): void {
    this.skillsCache.clear();
    this.governanceCache.clear();
    this.searchCache.clear();
  }

  /**
   * Get combined cache statistics
   */
  getStats() {
    return {
      skills: this.skillsCache.getStats(),
      governance: this.governanceCache.getStats(),
      search: {
        entries: this.searchCache.size,
        maxEntries: this.config.searchResults.maxItems,
        ttl: this.config.searchResults.ttl
      },
      total: {
        skills: this.skillsCache.getSize(),
        governance: this.governanceCache.getSize()
      }
    };
  }

  /**
   * Warm caches with data
   */
  async warmSkills(skills: Skill[]): Promise<void> {
    const entries = new Map(
      skills.map(s => [s.skillId, { value: s }])
    );
    this.skillsCache.warm(entries);
  }

  async warmGovernance(docs: GovernanceDocument[]): Promise<void> {
    const entries = new Map(
      docs.map(d => [d.docName, { value: d }])
    );
    this.governanceCache.warm(entries);
  }
}
