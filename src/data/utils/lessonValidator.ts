/**
 * LessonValidator - Validates lesson data integrity and structure
 * Ensures data consistency during migration and loading
 */

import metadata from '../metadata.json';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

interface ValidationStats {
  totalLessons: number;
  validLessons: number;
  totalExercises: number;
  validExercises: number;
  errors: string[];
  warnings: string[];
}

export class LessonValidator {
  private requiredLessonFields = [
    'id', 'title', 'level', 'difficulty', 'category', 'passingScore',
    'rule', 'explanation', 'examples', 'exercises'
  ];

  private requiredExerciseFields = [
    'id', 'type', 'answer', 'feedbackCorrect', 'feedbackIncorrect'
  ];

  private validDifficulties = metadata.difficulties;
  private validCategories = metadata.categories;
  private validExerciseTypes = ['qcm', 'fill-in-the-blank', 'drag-drop', 'transformation'];

  /**
   * Validate a single lesson
   */
  validateLesson(lesson: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required fields
    for (const field of this.requiredLessonFields) {
      if (!lesson[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    // Validate lesson ID format
    if (lesson.id && !this.isValidLessonId(lesson.id)) {
      errors.push(`Invalid lesson ID format: ${lesson.id}`);
    }

    // Validate level
    if (lesson.level && (!Number.isInteger(lesson.level) || lesson.level < 1 || lesson.level > 20)) {
      errors.push(`Invalid level: ${lesson.level}. Must be integer between 1-20`);
    }

    // Validate difficulty
    if (lesson.difficulty && !this.validDifficulties.includes(lesson.difficulty)) {
      errors.push(`Invalid difficulty: ${lesson.difficulty}. Must be one of: ${this.validDifficulties.join(', ')}`);
    }

    // Validate category
    if (lesson.category && !this.validCategories.includes(lesson.category)) {
      errors.push(`Invalid category: ${lesson.category}. Must be one of: ${this.validCategories.join(', ')}`);
    }

    // Validate passing score
    if (lesson.passingScore && (lesson.passingScore < 0 || lesson.passingScore > 100)) {
      errors.push(`Invalid passing score: ${lesson.passingScore}. Must be between 0-100`);
    }

    // Validate exercises
    if (lesson.exercises) {
      if (!Array.isArray(lesson.exercises)) {
        errors.push('Exercises must be an array');
      } else {
        lesson.exercises.forEach((exercise: any, index: number) => {
          const exerciseResult = this.validateExercise(exercise, lesson.id);
          exerciseResult.errors.forEach(error => 
            errors.push(`Exercise ${index + 1}: ${error}`)
          );
          exerciseResult.warnings.forEach(warning => 
            warnings.push(`Exercise ${index + 1}: ${warning}`)
          );
        });
      }
    }

    // Validate consistency between level and difficulty
    if (lesson.level && lesson.difficulty) {
      const expectedDifficulty = this.getDifficultyForLevel(lesson.level);
      if (expectedDifficulty !== lesson.difficulty) {
        warnings.push(`Level ${lesson.level} typically belongs to '${expectedDifficulty}' difficulty, but lesson is marked as '${lesson.difficulty}'`);
      }
    }

    // Check for minimum number of exercises
    if (lesson.exercises && lesson.exercises.length < 5) {
      warnings.push(`Lesson has only ${lesson.exercises.length} exercises. Recommended minimum is 5`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate a single exercise
   */
  validateExercise(exercise: any, lessonId?: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required fields
    for (const field of this.requiredExerciseFields) {
      if (!exercise[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    // Validate exercise ID format
    if (exercise.id && !this.isValidExerciseId(exercise.id, lessonId)) {
      warnings.push(`Exercise ID format doesn't follow convention: ${exercise.id}`);
    }

    // Validate exercise type
    if (exercise.type && !this.validExerciseTypes.includes(exercise.type)) {
      errors.push(`Invalid exercise type: ${exercise.type}. Must be one of: ${this.validExerciseTypes.join(', ')}`);
    }

    // Type-specific validations
    if (exercise.type === 'qcm') {
      if (!exercise.options || !Array.isArray(exercise.options)) {
        errors.push('QCM exercises must have options array');
      } else if (exercise.options.length < 2) {
        errors.push('QCM exercises must have at least 2 options');
      }
    }

    if (exercise.type === 'transformation') {
      if (!exercise.instruction) {
        errors.push('Transformation exercises must have instruction');
      }
    }

    // Validate answer format
    if (exercise.answer) {
      if (exercise.type === 'transformation' && !Array.isArray(exercise.answer)) {
        warnings.push('Transformation exercise answers should be arrays for multiple valid answers');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate an array of lessons
   */
  validateLessons(lessons: any[]): ValidationStats {
    const stats: ValidationStats = {
      totalLessons: lessons.length,
      validLessons: 0,
      totalExercises: 0,
      validExercises: 0,
      errors: [],
      warnings: []
    };

    lessons.forEach((lesson, index) => {
      const result = this.validateLesson(lesson);
      
      if (result.isValid) {
        stats.validLessons++;
      }

      // Add lesson-specific errors and warnings
      result.errors.forEach(error => 
        stats.errors.push(`Lesson ${index + 1} (${lesson.id || 'unknown'}): ${error}`)
      );
      result.warnings.forEach(warning => 
        stats.warnings.push(`Lesson ${index + 1} (${lesson.id || 'unknown'}): ${warning}`)
      );

      // Count exercises
      if (lesson.exercises && Array.isArray(lesson.exercises)) {
        stats.totalExercises += lesson.exercises.length;
        lesson.exercises.forEach((exercise: any) => {
          const exerciseResult = this.validateExercise(exercise, lesson.id);
          if (exerciseResult.isValid) {
            stats.validExercises++;
          }
        });
      }
    });

    return stats;
  }

  /**
   * Check for duplicate lesson IDs
   */
  checkForDuplicates(lessons: any[]): string[] {
    const ids = new Set<string>();
    const duplicates: string[] = [];

    lessons.forEach(lesson => {
      if (lesson.id) {
        if (ids.has(lesson.id)) {
          duplicates.push(lesson.id);
        } else {
          ids.add(lesson.id);
        }
      }
    });

    return duplicates;
  }

  /**
   * Validate lesson ID format
   */
  private isValidLessonId(id: string): boolean {
    // Expected format: category-topic-level (e.g., "sv-accord-1")
    return /^[a-z-]+-\d+$/.test(id);
  }

  /**
   * Validate exercise ID format
   */
  private isValidExerciseId(id: string, lessonId?: string): boolean {
    // Expected format: lessonId-type-number (e.g., "sv-1-qcm-1")
    if (lessonId) {
      const expectedPrefix = lessonId.replace(/-\d+$/, '');
      return id.startsWith(expectedPrefix);
    }
    return /^[a-z-]+-\d+-[a-z]+-\d+$/.test(id);
  }

  /**
   * Get expected difficulty for a given level
   */
  private getDifficultyForLevel(level: number): string {
    if (level >= 1 && level <= 5) return 'debutant';
    if (level >= 6 && level <= 9) return 'intermediaire';
    if (level >= 10 && level <= 13) return 'avance';
    if (level >= 14 && level <= 20) return 'expert';
    return 'unknown';
  }

  /**
   * Generate validation report
   */
  generateReport(stats: ValidationStats): string {
    const report = [
      '=== LESSON VALIDATION REPORT ===',
      `Total Lessons: ${stats.totalLessons}`,
      `Valid Lessons: ${stats.validLessons}`,
      `Total Exercises: ${stats.totalExercises}`,
      `Valid Exercises: ${stats.validExercises}`,
      '',
      `Errors: ${stats.errors.length}`,
      ...stats.errors.map(error => `  - ${error}`),
      '',
      `Warnings: ${stats.warnings.length}`,
      ...stats.warnings.map(warning => `  - ${warning}`),
      ''
    ];

    return report.join('\n');
  }
}