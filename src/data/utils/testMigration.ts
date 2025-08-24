/**
 * Test Migration Script
 * Validates the migration and provides detailed feedback
 */

import { MigrationValidator } from './migrationValidator';

/**
 * Run migration tests and log results
 */
export async function testMigration(): Promise<void> {
  console.log('🔍 Starting migration validation...');
  
  const validator = new MigrationValidator();
  
  try {
    const validation = await validator.validateMigration();
    
    console.log('\n📊 Migration Statistics:');
    console.log(`- Total lessons: ${validation.stats.totalLessons}`);
    console.log(`- Migrated lessons: ${validation.stats.migratedLessons}`);
    console.log(`- Legacy lessons: ${validation.stats.legacyLessons}`);
    console.log(`- Missing lessons: ${validation.stats.missingLessons.length}`);
    console.log(`- Duplicate lessons: ${validation.stats.duplicateLessons.length}`);
    
    if (validation.isValid) {
      console.log('\n✅ Migration validation PASSED!');
    } else {
      console.log('\n❌ Migration validation FAILED!');
    }
    
    if (validation.errors.length > 0) {
      console.log('\n🚨 Errors:');
      validation.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    if (validation.warnings.length > 0) {
      console.log('\n⚠️ Warnings:');
      validation.warnings.forEach(warning => console.log(`  - ${warning}`));
    }
    
    if (validation.stats.missingLessons.length > 0) {
      console.log('\n📋 Missing lessons:');
      validation.stats.missingLessons.forEach(lessonId => console.log(`  - ${lessonId}`));
    }
    
    // Generate detailed report
    const report = await validator.generateMigrationReport();
    console.log('\n📄 Detailed report generated.');
    console.log('\n' + '='.repeat(50));
    console.log(report);
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('❌ Migration test failed:', error);
  }
}

/**
 * Test individual lesson loading
 */
export async function testLessonLoading(): Promise<void> {
  console.log('\n🧪 Testing individual lesson loading...');
  
  try {
    const { ModularLessonSystem } = await import('../index');
    const system = new ModularLessonSystem();
    
    // Test loading débutant lessons
    console.log('\n📚 Testing débutant lessons:');
    const debutantLessons = await system.getLessonsByDifficulty('debutant');
    console.log(`  - Loaded ${debutantLessons.length} débutant lessons`);
    
    debutantLessons.forEach((lesson: any) => {
      console.log(`    • ${lesson.id}: ${lesson.title} (Level ${lesson.level})`);
    });
    
    // Test loading specific lesson
    if (debutantLessons.length > 0) {
      const firstLesson = debutantLessons[0];
      console.log(`\n🎯 Testing specific lesson loading: ${firstLesson.id}`);
      const loadedLesson = await system.getLessonById(firstLesson.id);
      
      if (loadedLesson) {
        console.log(`  ✅ Successfully loaded: ${loadedLesson.title}`);
        console.log(`  - Exercises: ${loadedLesson.exercises.length}`);
        console.log(`  - Category: ${loadedLesson.category}`);
        console.log(`  - Difficulty: ${loadedLesson.difficulty}`);
      } else {
        console.log(`  ❌ Failed to load lesson: ${firstLesson.id}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Lesson loading test failed:', error);
  }
}

/**
 * Run all migration tests
 */
export async function runAllTests(): Promise<void> {
  console.log('🚀 Running comprehensive migration tests...');
  console.log('=' .repeat(60));
  
  await testMigration();
  await testLessonLoading();
  
  console.log('\n🏁 All tests completed!');
  console.log('=' .repeat(60));
}

// Export for use in browser console or Node.js
if (typeof window !== 'undefined') {
  // Browser environment - attach to window for console access
  (window as any).testMigration = {
    runAll: runAllTests,
    validateMigration: testMigration,
    testLessonLoading: testLessonLoading
  };
  
  console.log('🔧 Migration tests available in browser console:');
  console.log('  - window.testMigration.runAll()');
  console.log('  - window.testMigration.validateMigration()');
  console.log('  - window.testMigration.testLessonLoading()');
}