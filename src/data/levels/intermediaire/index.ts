/**
 * Intermédiaire Level Lessons Index
 * Levels 6-9 (6e-5e)
 * Focuses on advanced orthographe and introduction to conjugaison
 */

export interface IntermediaireLesson {
  id: string;
  title: string;
  level: number;
  difficulty: 'intermediaire';
  targetAudience: '6e-5e';
  category: 'orthographe' | 'conjugaison' | 'ponctuation';
  passingScore: number;
  prerequisites: string[];
}

// Lesson metadata for quick access
export const intermediaireLessons: IntermediaireLesson[] = [
  {
    id: 'pluriels-noms-6',
    title: 'Pluriels des Noms',
    level: 6,
    difficulty: 'intermediaire',
    targetAudience: '6e-5e',
    category: 'orthographe',
    passingScore: 75,
    prerequisites: ['accord-gn-5']
  },
  {
    id: 'participe-passe-etre-avoir-7',
    title: 'Participe Passé avec Être et Avoir',
    level: 7,
    difficulty: 'intermediaire',
    targetAudience: '6e-5e',
    category: 'conjugaison',
    passingScore: 75,
    prerequisites: ['pluriels-noms-6']
  },
  {
    id: 'ponctuation-dialogue-9',
    title: 'Ponctuation dans le Dialogue',
    level: 9,
    difficulty: 'intermediaire',
    targetAudience: '6e-5e',
    category: 'ponctuation',
    passingScore: 75,
    prerequisites: ['homophones-complexes-8']
  },
  {
    id: 'homophones-complexes-8',
    title: 'Homophones Complexes',
    level: 8,
    difficulty: 'intermediaire',
    targetAudience: '6e-5e',
    category: 'orthographe',
    passingScore: 75,
    prerequisites: ['participe-passe-etre-avoir-7']
  }
];

/**
 * Get lesson metadata by ID
 */
export function getIntermediaireeLessonById(id: string): IntermediaireLesson | undefined {
  return intermediaireLessons.find(lesson => lesson.id === id);
}

/**
 * Get lessons by level range
 */
export function getIntermediaireLessonsByLevel(minLevel: number, maxLevel: number): IntermediaireLesson[] {
  return intermediaireLessons.filter(lesson => lesson.level >= minLevel && lesson.level <= maxLevel);
}

/**
 * Get lessons by category
 */
export function getIntermediaireLessonsByCategory(category: string): IntermediaireLesson[] {
  return intermediaireLessons.filter(lesson => lesson.category === category);
}

/**
 * Get all lesson IDs in order
 */
export function getIntermediaireLessonIds(): string[] {
  return intermediaireLessons.map(lesson => lesson.id);
}

/**
 * Get lesson progression path
 */
export function getIntermediaireProgressionPath(): string[] {
  return intermediaireLessons
    .sort((a, b) => a.level - b.level)
    .map(lesson => lesson.id);
}

/**
 * Check if a lesson exists
 */
export function hasIntermediaireLesson(id: string): boolean {
  return intermediaireLessons.some(lesson => lesson.id === id);
}

/**
 * Get next lesson in progression
 */
export function getNextIntermediaireLesson(currentId: string): IntermediaireLesson | undefined {
  const currentLesson = getIntermediaireeLessonById(currentId);
  if (!currentLesson) return undefined;
  
  return intermediaireLessons.find(lesson => lesson.level === currentLesson.level + 1);
}

/**
 * Get previous lesson in progression
 */
export function getPreviousIntermediaireLesson(currentId: string): IntermediaireLesson | undefined {
  const currentLesson = getIntermediaireeLessonById(currentId);
  if (!currentLesson) return undefined;
  
  return intermediaireLessons.find(lesson => lesson.level === currentLesson.level - 1);
}

export default intermediaireLessons;