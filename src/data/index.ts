/**
 * Main entry point for the modular lesson system
 * Provides backward compatibility while enabling new modular loading
 */

import { Lesson } from '../types';
import { LessonLoader } from './utils/lessonLoader';
import { LessonCache } from './utils/lessonCache';
import metadata from './metadata.json';

// Legacy lessons will be loaded dynamically when needed

export class ModularLessonSystem {
  private loader: LessonLoader;
  private cache: LessonCache;

  constructor() {
    this.loader = new LessonLoader();
    this.cache = new LessonCache();
  }

  /**
   * Get all lessons - uses modular system (legacy compatibility removed)
   */
  async getAllLessons(): Promise<Lesson[]> {
    // Load from modular system
    const lessons = await this.loader.loadAllLessons();
    return lessons.map((lesson: any) => ({
      ...lesson,
      difficulty: lesson.difficulty as 'debutant' | 'intermediaire' | 'avance' | 'expert',
      category: lesson.category as 'orthographe' | 'conjugaison' | 'ponctuation' | 'syntaxe',
      exercises: lesson.exercises.map((exercise: any) => ({
        ...exercise,
        type: exercise.type as 'qcm' | 'fill-in-the-blank' | 'drag-drop' | 'transformation' | 'dictation'
      })),
      unlocked: false,
      completed: false
    }));
  }

  /**
   * Get lessons by difficulty level
   */
  async getLessonsByDifficulty(difficulty: string): Promise<Lesson[]> {
    const lessons = await this.loader.loadLessonsByDifficulty(difficulty);
    return lessons.map((lesson: any) => ({
      ...lesson,
      difficulty: (lesson.difficulty || 'debutant') as 'debutant' | 'intermediaire' | 'avance' | 'expert',
      category: (lesson.category || 'orthographe') as 'orthographe' | 'conjugaison' | 'ponctuation' | 'syntaxe',
      exercises: Array.isArray(lesson.exercises) ? lesson.exercises.map((exercise: any) => ({
        ...exercise,
        type: exercise.type as 'qcm' | 'fill-in-the-blank' | 'drag-drop' | 'transformation' | 'dictation'
      })) : [],
      unlocked: false,
      completed: false
    }));
  }

  /**
   * Get a specific lesson by ID
   */
  async getLessonById(id: string): Promise<Lesson | null> {
    // Check cache first
    const cached = this.cache.get(id);
    if (cached) {
      return cached;
    }
    
    const lesson = await this.loader.loadLessonById(id);
    if (lesson) {
      const transformedLesson = {
        ...lesson,
        difficulty: (lesson.difficulty || 'debutant') as 'debutant' | 'intermediaire' | 'avance' | 'expert',
        category: (lesson.category || 'orthographe') as 'orthographe' | 'conjugaison' | 'ponctuation' | 'syntaxe',
        exercises: Array.isArray(lesson.exercises) ? lesson.exercises.map((exercise: any) => ({
          ...exercise,
          type: exercise.type as 'qcm' | 'fill-in-the-blank' | 'drag-drop' | 'transformation' | 'dictation'
        })) : [],
        unlocked: false,
        completed: false
      };
      this.cache.set(id, transformedLesson);
      return transformedLesson;
    }
    return null;
  }

  /**
   * Get lessons by category
   */
  async getLessonsByCategory(category: string): Promise<Lesson[]> {
    const lessons = await this.loader.loadLessonsByCategory(category);
    return lessons.map((lesson: any) => ({
      ...lesson,
      difficulty: (lesson.difficulty || 'debutant') as 'debutant' | 'intermediaire' | 'avance' | 'expert',
      category: (lesson.category || 'orthographe') as 'orthographe' | 'conjugaison' | 'ponctuation' | 'syntaxe',
      exercises: Array.isArray(lesson.exercises) ? lesson.exercises.map((exercise: any) => ({
        ...exercise,
        type: exercise.type as 'qcm' | 'fill-in-the-blank' | 'drag-drop' | 'transformation' | 'dictation'
      })) : [],
      unlocked: false,
      completed: false
    }));
  }

  /**
   * Get system metadata
   */
  getMetadata() {
    return metadata;
  }

  /**
   * Check if migration is complete
   */
  isMigrationComplete(): boolean {
    return metadata.migration.status === 'complete';
  }


}

// Export singleton instance
export const lessonSystem = new ModularLessonSystem();

// Export metadata for direct access
export { metadata };

// Legacy export removed - migration complete