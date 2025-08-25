/**
 * Lazy loading utility for optimizing JSON data loading
 * Implements caching, preloading, and memory management
 */

export interface LazyLoadOptions {
  preload?: boolean;
  cacheSize?: number;
  timeout?: number;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
}

/**
 * Generic lazy loader with LRU cache and preloading capabilities
 */
export class LazyLoader<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private loadingPromises = new Map<string, Promise<T>>();
  private readonly maxCacheSize: number;
  private readonly cacheTimeout: number;

  constructor(options: LazyLoadOptions = {}) {
    this.maxCacheSize = options.cacheSize || 10;
    this.cacheTimeout = options.timeout || 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Load data with caching and deduplication
   * @param key - Unique identifier for the data
   * @param loader - Function to load the data
   * @returns Promise resolving to the loaded data
   */
  async load(key: string, loader: () => Promise<T>): Promise<T> {
    // Check if data is in cache and still valid
    const cached = this.getCachedData(key);
    if (cached) {
      return cached;
    }

    // Check if already loading
    const existingPromise = this.loadingPromises.get(key);
    if (existingPromise) {
      return existingPromise;
    }

    // Start loading
    const loadingPromise = this.performLoad(key, loader);
    this.loadingPromises.set(key, loadingPromise);

    try {
      const data = await loadingPromise;
      this.cacheData(key, data);
      return data;
    } finally {
      this.loadingPromises.delete(key);
    }
  }

  /**
   * Preload data in the background
   * @param key - Unique identifier for the data
   * @param loader - Function to load the data
   */
  preload(key: string, loader: () => Promise<T>): void {
    // Don't preload if already cached or loading
    if (this.cache.has(key) || this.loadingPromises.has(key)) {
      return;
    }

    // Preload in background without blocking
    this.load(key, loader).catch(error => {
      console.warn(`Preload failed for key ${key}:`, error);
    });
  }

  /**
   * Get cached data if valid
   * @param key - Cache key
   * @returns Cached data or null
   */
  private getCachedData(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    const now = Date.now();
    // Check if cache entry is expired
    if (now - entry.timestamp > this.cacheTimeout) {
      this.cache.delete(key);
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = now;
    return entry.data;
  }

  /**
   * Cache data with LRU eviction
   * @param key - Cache key
   * @param data - Data to cache
   */
  private cacheData(key: string, data: T): void {
    const now = Date.now();
    
    // Evict old entries if cache is full
    if (this.cache.size >= this.maxCacheSize) {
      this.evictLeastRecentlyUsed();
    }

    this.cache.set(key, {
      data,
      timestamp: now,
      accessCount: 1,
      lastAccessed: now
    });
  }

  /**
   * Evict least recently used cache entry
   */
  private evictLeastRecentlyUsed(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Perform the actual loading with error handling
   * @param key - Cache key
   * @param loader - Loader function
   * @returns Promise resolving to loaded data
   */
  private async performLoad(key: string, loader: () => Promise<T>): Promise<T> {
    try {
      return await loader();
    } catch (error) {
      console.error(`Failed to load data for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.cache.clear();
    this.loadingPromises.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize,
      loadingCount: this.loadingPromises.size,
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        accessCount: entry.accessCount,
        age: Date.now() - entry.timestamp
      }))
    };
  }
}

/**
 * Specialized lazy loader for lesson data
 */
export class LessonLazyLoader extends LazyLoader<any> {
  constructor() {
    super({
      cacheSize: 15, // Cache up to 15 lessons
      timeout: 10 * 60 * 1000 // 10 minutes timeout
    });
  }

  /**
   * Load lesson by difficulty with automatic preloading
   * @param difficulty - Lesson difficulty level
   * @returns Promise resolving to lessons array
   */
  async loadLessonsByDifficulty(difficulty: string): Promise<any[]> {
    const key = `lessons-${difficulty}`;
    
    const lessons = await this.load(key, async () => {
      try {
        const module = await import(`../data/levels/${difficulty}/index.ts`);
        return module.default || module[`${difficulty}Lessons`] || [];
      } catch (error) {
        // Fallback to static imports
        console.warn(`Dynamic import failed for ${difficulty}, using fallback`);
        return [];
      }
    });

    // Preload adjacent difficulty levels
    this.preloadAdjacentLevels(difficulty);

    return lessons;
  }

  /**
   * Load all lessons from all difficulty levels
   * @returns Promise resolving to all lessons array
   */
  async loadAllLessons(): Promise<any[]> {
    const difficulties = ['debutant', 'intermediaire', 'avance', 'expert'];
    const allLessons: any[] = [];

    for (const difficulty of difficulties) {
      try {
        const lessons = await this.loadLessonsByDifficulty(difficulty);
        allLessons.push(...lessons);
      } catch (error) {
        console.warn(`Failed to load lessons for difficulty ${difficulty}:`, error);
      }
    }

    return allLessons;
  }

  /**
   * Preload specific lesson content
   * @param lessonId - ID of the lesson to preload
   * @returns Promise resolving when preload is complete
   */
  async preloadLesson(lessonId: string): Promise<void> {
    const key = `lesson-content-${lessonId}`;
    
    this.preload(key, async () => {
      // This would load specific lesson content, exercises, etc.
      // For now, we'll just return a placeholder
      return { id: lessonId, preloaded: true, timestamp: Date.now() };
    });
  }

  /**
   * Preload adjacent difficulty levels for better UX
   * @param currentDifficulty - Current difficulty level
   */
  private preloadAdjacentLevels(currentDifficulty: string): void {
    const levels = ['debutant', 'intermediaire', 'avance', 'expert'];
    const currentIndex = levels.indexOf(currentDifficulty);
    
    if (currentIndex === -1) return;

    // Preload next level
    if (currentIndex < levels.length - 1) {
      const nextLevel = levels[currentIndex + 1];
      this.preload(`lessons-${nextLevel}`, async () => {
        try {
          const module = await import(`../data/levels/${nextLevel}/index.ts`);
          return module.default || module[`${nextLevel}Lessons`] || [];
        } catch (error) {
          console.warn(`Preload failed for ${nextLevel}:`, error);
          return [];
        }
      });
    }

    // Preload previous level
    if (currentIndex > 0) {
      const prevLevel = levels[currentIndex - 1];
      this.preload(`lessons-${prevLevel}`, async () => {
        try {
          const module = await import(`../data/levels/${prevLevel}/index.ts`);
          return module.default || module[`${prevLevel}Lessons`] || [];
        } catch (error) {
          console.warn(`Preload failed for ${prevLevel}:`, error);
          return [];
        }
      });
    }
  }
}

// Global instance for lesson loading
export const lessonLazyLoader = new LessonLazyLoader();