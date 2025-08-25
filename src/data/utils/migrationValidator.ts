/**
 * Migration Validator - Ensures data integrity during migration
 * Compares old lessons.json with new modular structure
 */

import { Lesson } from '../../types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    totalLessons: number;
    migratedLessons: number;
    legacyLessons: number;
    missingLessons: string[];
    duplicateLessons: string[];
  };
}

export class MigrationValidator {
  constructor() {
    // ModularLessonSystem will be loaded dynamically when needed
  }

  /**
   * Validate the migration by comparing old and new systems
   */
  async validateMigration(): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      stats: {
        totalLessons: 0,
        migratedLessons: 0,
        legacyLessons: 0,
        missingLessons: [],
        duplicateLessons: []
      }
    };

    try {
      // Load legacy lessons
      const legacyModule = await import('../lessons.json');
      const allLegacyLessons: Lesson[] = legacyModule.default.lessons.map((lesson: any) => ({
        ...lesson,
        unlocked: false,
        completed: false
      }));
      result.stats.totalLessons = allLegacyLessons.length;

      // Load modular lessons using dynamic import
      const modularLessons: Lesson[] = [];
      
      try {
        const { ModularLessonSystem } = await import('../index');
        const modularSystem = new ModularLessonSystem();
        
        // Try to load from each difficulty level
        const difficulties = ['debutant', 'intermediaire', 'avance', 'expert'];
        
        for (const difficulty of difficulties) {
          try {
            const lessons = await modularSystem.getLessonsByDifficulty(difficulty);
            modularLessons.push(...lessons);
            result.stats.migratedLessons += lessons.length;
          } catch (error) {
            result.warnings.push(`Could not load ${difficulty} lessons: ${error}`);
          }
        }
      } catch (error) {
        result.errors.push(`Failed to load modular system: ${error}`);
      }

      // Compare lessons
      const legacyIds = new Set(allLegacyLessons.map(l => l.id));
      const modularIds = new Set(modularLessons.map(l => l.id));

      // Find missing lessons (in legacy but not in modular)
      for (const legacyId of legacyIds) {
        if (!modularIds.has(legacyId)) {
          result.stats.missingLessons.push(legacyId);
        }
      }

      // Find duplicate lessons (in modular but not expected)
      const modularIdCounts = new Map<string, number>();
      modularLessons.forEach(lesson => {
        const count = modularIdCounts.get(lesson.id) || 0;
        modularIdCounts.set(lesson.id, count + 1);
      });

      for (const [id, count] of modularIdCounts) {
        if (count > 1) {
          result.stats.duplicateLessons.push(id);
        }
      }

      result.stats.legacyLessons = result.stats.totalLessons - result.stats.migratedLessons;

      // Validate individual lessons
      for (const modularLesson of modularLessons) {
        const legacyLesson = allLegacyLessons.find(l => l.id === modularLesson.id);
        if (legacyLesson) {
          const lessonValidation = this.validateLesson(legacyLesson, modularLesson);
          result.errors.push(...lessonValidation.errors);
          result.warnings.push(...lessonValidation.warnings);
        }
      }

      // Set overall validity
      result.isValid = result.errors.length === 0 && result.stats.missingLessons.length === 0;

      return result;
    } catch (error) {
      result.isValid = false;
      result.errors.push(`Migration validation failed: ${error}`);
      return result;
    }
  }

  /**
   * Validate a single lesson against its legacy counterpart
   */
  private validateLesson(legacy: Lesson, modular: Lesson): { errors: string[], warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check essential properties
    if (legacy.id !== modular.id) {
      errors.push(`Lesson ID mismatch: ${legacy.id} vs ${modular.id}`);
    }

    if (legacy.title !== modular.title) {
      errors.push(`Lesson title mismatch for ${legacy.id}: "${legacy.title}" vs "${modular.title}"`);
    }

    if (legacy.level !== modular.level) {
      errors.push(`Lesson level mismatch for ${legacy.id}: ${legacy.level} vs ${modular.level}`);
    }

    if (legacy.difficulty !== modular.difficulty) {
      errors.push(`Lesson difficulty mismatch for ${legacy.id}: ${legacy.difficulty} vs ${modular.difficulty}`);
    }

    if (legacy.category !== modular.category) {
      errors.push(`Lesson category mismatch for ${legacy.id}: ${legacy.category} vs ${modular.category}`);
    }

    // Check exercises count
    if (legacy.exercises.length !== modular.exercises.length) {
      warnings.push(`Exercise count mismatch for ${legacy.id}: ${legacy.exercises.length} vs ${modular.exercises.length}`);
    }

    // Check exercise IDs
    const legacyExerciseIds = new Set(legacy.exercises.map(e => e.id));
    const modularExerciseIds = new Set(modular.exercises.map(e => e.id));
    
    for (const legacyExId of legacyExerciseIds) {
      if (!modularExerciseIds.has(legacyExId)) {
        errors.push(`Missing exercise ${legacyExId} in lesson ${legacy.id}`);
      }
    }

    return { errors, warnings };
  }

  /**
   * Generate a detailed migration report
   */
  async generateMigrationReport(): Promise<string> {
    const validation = await this.validateMigration();
    
    let report = '# Migration Validation Report\n\n';
    
    // Overall status
    report += `## Overall Status: ${validation.isValid ? '✅ VALID' : '❌ INVALID'}\n\n`;
    
    // Statistics
    report += '## Statistics\n';
    report += `- Total lessons: ${validation.stats.totalLessons}\n`;
    report += `- Migrated lessons: ${validation.stats.migratedLessons}\n`;
    report += `- Legacy lessons: ${validation.stats.legacyLessons}\n`;
    report += `- Missing lessons: ${validation.stats.missingLessons.length}\n`;
    report += `- Duplicate lessons: ${validation.stats.duplicateLessons.length}\n\n`;
    
    // Errors
    if (validation.errors.length > 0) {
      report += '## ❌ Errors\n';
      validation.errors.forEach(error => {
        report += `- ${error}\n`;
      });
      report += '\n';
    }
    
    // Warnings
    if (validation.warnings.length > 0) {
      report += '## ⚠️ Warnings\n';
      validation.warnings.forEach(warning => {
        report += `- ${warning}\n`;
      });
      report += '\n';
    }
    
    // Missing lessons
    if (validation.stats.missingLessons.length > 0) {
      report += '## 📋 Missing Lessons\n';
      validation.stats.missingLessons.forEach(lessonId => {
        report += `- ${lessonId}\n`;
      });
      report += '\n';
    }
    
    // Duplicate lessons
    if (validation.stats.duplicateLessons.length > 0) {
      report += '## 🔄 Duplicate Lessons\n';
      validation.stats.duplicateLessons.forEach(lessonId => {
        report += `- ${lessonId}\n`;
      });
      report += '\n';
    }
    
    return report;
  }
}

export default MigrationValidator;