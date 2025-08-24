/**
 * LessonLoader - Handles dynamic loading of lessons from modular structure
 * Supports lazy loading and efficient data retrieval
 */

import { Lesson } from '../../types';
import metadata from '../metadata.json';

export class LessonLoader {
  private loadedLessons: Map<string, Lesson> = new Map();
  private loadedDifficulties: Set<string> = new Set();

  /**
   * Load all lessons from all difficulty levels
   */
  async loadAllLessons(): Promise<Lesson[]> {
    const allLessons: Lesson[] = [];
    
    for (const difficulty of metadata.difficulties) {
      const lessons = await this.loadLessonsByDifficulty(difficulty);
      allLessons.push(...lessons);
    }
    
    return allLessons;
  }

  /**
   * Load lessons by difficulty level
   */
  async loadLessonsByDifficulty(difficulty: string): Promise<Lesson[]> {
    if (this.loadedDifficulties.has(difficulty)) {
      return Array.from(this.loadedLessons.values())
        .filter(lesson => lesson.difficulty === difficulty);
    }

    try {
      // Dynamic import based on difficulty level
      const difficultyModule = await import(`../levels/${difficulty}/index.js`);
      const lessons = difficultyModule.default || difficultyModule.lessons;
      
      // Cache loaded lessons
      lessons.forEach((lesson: Lesson) => {
        this.loadedLessons.set(lesson.id, lesson);
      });
      
      this.loadedDifficulties.add(difficulty);
      return lessons;
    } catch (error) {
      console.warn(`Failed to load lessons for difficulty ${difficulty}:`, error);
      return [];
    }
  }

  /**
   * Load a specific lesson by ID
   */
  async loadLessonById(id: string): Promise<Lesson | null> {
    // Check if already loaded
    if (this.loadedLessons.has(id)) {
      return this.loadedLessons.get(id) || null;
    }

    // Try to determine difficulty from lesson ID pattern
    const difficulty = this.getDifficultyFromLessonId(id);
    if (difficulty) {
      const lessons = await this.loadLessonsByDifficulty(difficulty);
      return lessons.find(lesson => lesson.id === id) || null;
    }

    // Fallback: search all difficulties
    for (const diff of metadata.difficulties) {
      const lessons = await this.loadLessonsByDifficulty(diff);
      const lesson = lessons.find(l => l.id === id);
      if (lesson) {
        return lesson;
      }
    }

    return null;
  }

  /**
   * Load lessons by category
   */
  async loadLessonsByCategory(category: string): Promise<Lesson[]> {
    const allLessons = await this.loadAllLessons();
    return allLessons.filter(lesson => lesson.category === category);
  }

  /**
   * Load lessons by level range
   */
  async loadLessonsByLevelRange(minLevel: number, maxLevel: number): Promise<Lesson[]> {
    const allLessons = await this.loadAllLessons();
    return allLessons.filter(lesson => 
      lesson.level >= minLevel && lesson.level <= maxLevel
    );
  }

  /**
   * Preload lessons for a specific difficulty to improve performance
   */
  async preloadDifficulty(difficulty: string): Promise<void> {
    if (!this.loadedDifficulties.has(difficulty)) {
      await this.loadLessonsByDifficulty(difficulty);
    }
  }

  /**
   * Clear cache for memory management
   */
  clearCache(): void {
    this.loadedLessons.clear();
    this.loadedDifficulties.clear();
  }

  /**
   * Get loading statistics
   */
  getLoadingStats() {
    return {
      loadedLessons: this.loadedLessons.size,
      loadedDifficulties: Array.from(this.loadedDifficulties),
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  /**
   * Determine difficulty level from lesson ID pattern
   */
  private getDifficultyFromLessonId(id: string): string | null {
    // Extract level number from lesson ID (assuming pattern like "lesson-name-X")
    const levelMatch = id.match(/-?(\d+)$/);
    if (levelMatch) {
      const level = parseInt(levelMatch[1]);
      
      if (level >= 1 && level <= 5) return 'debutant';
      if (level >= 6 && level <= 9) return 'intermediaire';
      if (level >= 10 && level <= 13) return 'avance';
      if (level >= 14 && level <= 20) return 'expert';
    }
    
    return null;
  }

  /**
   * Estimate memory usage of cached lessons
   */
  private estimateMemoryUsage(): number {
    let totalSize = 0;
    this.loadedLessons.forEach(lesson => {
      totalSize += JSON.stringify(lesson).length * 2; // Rough estimate
    });
    return totalSize;
  }
}