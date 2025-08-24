/**
 * LessonCache - Intelligent caching system for lesson data
 * Implements LRU (Least Recently Used) cache with size limits
 */

import { Lesson } from '../../types';

interface CacheEntry {
  lesson: Lesson;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
}

export class LessonCache {
  private cache: Map<string, CacheEntry> = new Map();
  private maxSize: number;
  private maxAge: number; // in milliseconds
  private hitCount: number = 0;
  private missCount: number = 0;

  constructor(maxSize: number = 50, maxAgeMinutes: number = 30) {
    this.maxSize = maxSize;
    this.maxAge = maxAgeMinutes * 60 * 1000; // Convert to milliseconds
  }

  /**
   * Get a lesson from cache
   */
  get(lessonId: string): Lesson | null {
    const entry = this.cache.get(lessonId);
    
    if (!entry) {
      this.missCount++;
      return null;
    }

    // Check if entry has expired
    if (this.isExpired(entry)) {
      this.cache.delete(lessonId);
      this.missCount++;
      return null;
    }

    // Update access statistics
    entry.lastAccessed = Date.now();
    entry.accessCount++;
    this.hitCount++;

    return entry.lesson;
  }

  /**
   * Store a lesson in cache
   */
  set(lessonId: string, lesson: Lesson): void {
    // Remove existing entry if present
    if (this.cache.has(lessonId)) {
      this.cache.delete(lessonId);
    }

    // Check if cache is full and evict if necessary
    if (this.cache.size >= this.maxSize) {
      this.evictLeastRecentlyUsed();
    }

    // Add new entry
    const entry: CacheEntry = {
      lesson,
      timestamp: Date.now(),
      accessCount: 1,
      lastAccessed: Date.now()
    };

    this.cache.set(lessonId, entry);
  }

  /**
   * Check if a lesson is cached
   */
  has(lessonId: string): boolean {
    const entry = this.cache.get(lessonId);
    return entry !== undefined && !this.isExpired(entry);
  }

  /**
   * Remove a specific lesson from cache
   */
  delete(lessonId: string): boolean {
    return this.cache.delete(lessonId);
  }

  /**
   * Clear all cached lessons
   */
  clear(): void {
    this.cache.clear();
    this.hitCount = 0;
    this.missCount = 0;
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const totalRequests = this.hitCount + this.missCount;
    const hitRate = totalRequests > 0 ? (this.hitCount / totalRequests) * 100 : 0;

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitCount: this.hitCount,
      missCount: this.missCount,
      hitRate: Math.round(hitRate * 100) / 100,
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  /**
   * Get all cached lesson IDs
   */
  getCachedLessonIds(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Preload multiple lessons into cache
   */
  preload(lessons: Lesson[]): void {
    lessons.forEach(lesson => {
      this.set(lesson.id, lesson);
    });
  }

  /**
   * Clean expired entries
   */
  cleanup(): number {
    let removedCount = 0;
    // Clean up expired entries
    Date.now();

    for (const [lessonId, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(lessonId);
        removedCount++;
      }
    }

    return removedCount;
  }

  /**
   * Get most accessed lessons
   */
  getMostAccessed(limit: number = 10): Array<{id: string, accessCount: number}> {
    return Array.from(this.cache.entries())
      .map(([id, entry]) => ({ id, accessCount: entry.accessCount }))
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, limit);
  }

  /**
   * Check if cache entry has expired
   */
  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > this.maxAge;
  }

  /**
   * Evict least recently used entry
   */
  private evictLeastRecentlyUsed(): void {
    let oldestEntry: string | null = null;
    let oldestTime = Date.now();

    for (const [lessonId, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestEntry = lessonId;
      }
    }

    if (oldestEntry) {
      this.cache.delete(oldestEntry);
    }
  }

  /**
   * Estimate memory usage of cache
   */
  private estimateMemoryUsage(): number {
    let totalSize = 0;
    this.cache.forEach(entry => {
      totalSize += JSON.stringify(entry.lesson).length * 2; // Rough estimate
    });
    return totalSize;
  }

  /**
   * Set cache configuration
   */
  configure(options: { maxSize?: number; maxAgeMinutes?: number }): void {
    if (options.maxSize !== undefined) {
      this.maxSize = options.maxSize;
      // Evict entries if new size is smaller
      while (this.cache.size > this.maxSize) {
        this.evictLeastRecentlyUsed();
      }
    }
    
    if (options.maxAgeMinutes !== undefined) {
      this.maxAge = options.maxAgeMinutes * 60 * 1000;
    }
  }
}