/**
 * Main entry point for the modular lesson system
 * Provides backward compatibility while enabling new modular loading
 */

import { Lesson } from '../types';
import { LessonLoader } from './utils/lessonLoader';
import { LessonCache } from './utils/lessonCache';
import metadata from './metadata.json';

// Legacy import for backward compatibility
import legacyLessons from './lessons.json';

export class ModularLessonSystem {
  private loader: LessonLoader;
  private cache: LessonCache;
  private compatibilityMode: boolean;

  constructor() {
    this.loader = new LessonLoader();
    this.cache = new LessonCache();
    this.compatibilityMode = metadata.migration.compatibilityMode;
  }

  /**
   * Get all lessons - uses legacy system if compatibility mode is enabled
   */
  async getAllLessons(): Promise<Lesson[]> {
    if (this.compatibilityMode && Array.isArray(legacyLessons.lessons) && legacyLessons.lessons.length > 0) {
      return legacyLessons.lessons.map((lesson: any) => ({
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
    if (this.compatibilityMode && Array.isArray(legacyLessons.lessons) && legacyLessons.lessons.length > 0) {
      return legacyLessons.lessons
        .filter((lesson: any) => lesson && typeof lesson === 'object' && lesson.difficulty === difficulty)
        .map((lesson: any) => ({
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

    if (this.compatibilityMode && legacyLessons.lessons && Array.isArray(legacyLessons.lessons) && legacyLessons.lessons.length > 0) {
      const lesson = legacyLessons.lessons.find((lesson: any) => lesson.id === id);
      if (lesson && typeof lesson === 'object') {
        const transformedLesson: Lesson = {
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
    if (this.compatibilityMode && Array.isArray(legacyLessons.lessons) && legacyLessons.lessons.length > 0) {
      return legacyLessons.lessons
        .filter((lesson: any) => lesson && typeof lesson === 'object' && lesson.category === category)
        .map((lesson: any) => ({
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

  /**
   * Enable/disable compatibility mode
   */
  setCompatibilityMode(enabled: boolean) {
    this.compatibilityMode = enabled;
  }
}

// Export singleton instance
export const lessonSystem = new ModularLessonSystem();

// Export metadata for direct access
export { metadata };

// Legacy export for backward compatibility
export { legacyLessons };