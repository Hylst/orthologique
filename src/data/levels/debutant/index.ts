/**
 * Débutant Level Lessons Index
 * Levels 1-5 (CM1-CM2)
 * All lessons focus on orthographe (spelling) fundamentals
 */

export interface DebutantLesson {
  id: string;
  title: string;
  level: number;
  difficulty: 'debutant';
  targetAudience: 'CM1-CM2';
  category: 'orthographe';
  passingScore: number;
  prerequisites: string[];
}

// Lesson metadata for quick access
export const debutantLessons: DebutantLesson[] = [
  {
    id: 'sv-accord-1',
    title: 'Accord Sujet-Verbe',
    level: 1,
    difficulty: 'debutant',
    targetAudience: 'CM1-CM2',
    category: 'orthographe',
    passingScore: 70,
    prerequisites: []
  },
  {
    id: 'homophone-a-2',
    title: 'Homophones a / à',
    level: 2,
    difficulty: 'debutant',
    targetAudience: 'CM1-CM2',
    category: 'orthographe',
    passingScore: 70,
    prerequisites: ['sv-accord-1']
  },
  {
    id: 'homophone-est-et-3',
    title: 'Homophones est / et',
    level: 3,
    difficulty: 'debutant',
    targetAudience: 'CM1-CM2',
    category: 'orthographe',
    passingScore: 70,
    prerequisites: ['homophone-a-2']
  },
  {
    id: 'homophone-son-sont-4',
    title: 'Homophones son / sont',
    level: 4,
    difficulty: 'debutant',
    targetAudience: 'CM1-CM2',
    category: 'orthographe',
    passingScore: 70,
    prerequisites: ['homophone-est-et-3']
  },
  {
    id: 'accord-gn-5',
    title: "L'accord dans le Groupe Nominal",
    level: 5,
    difficulty: 'debutant',
    targetAudience: 'CM1-CM2',
    category: 'orthographe',
    passingScore: 70,
    prerequisites: ['homophone-son-sont-4']
  }
];

/**
 * Get lesson metadata by ID
 */
export function getDebutantLessonById(id: string): DebutantLesson | undefined {
  return debutantLessons.find(lesson => lesson.id === id);
}

/**
 * Get lessons by level range
 */
export function getDebutantLessonsByLevel(minLevel: number, maxLevel: number): DebutantLesson[] {
  return debutantLessons.filter(lesson => lesson.level >= minLevel && lesson.level <= maxLevel);
}

/**
 * Get all lesson IDs in order
 */
export function getDebutantLessonIds(): string[] {
  return debutantLessons.map(lesson => lesson.id);
}

/**
 * Get lesson progression path
 */
export function getDebutantProgressionPath(): string[] {
  return debutantLessons
    .sort((a, b) => a.level - b.level)
    .map(lesson => lesson.id);
}

/**
 * Check if a lesson exists
 */
export function hasDebutantLesson(id: string): boolean {
  return debutantLessons.some(lesson => lesson.id === id);
}

/**
 * Get next lesson in progression
 */
export function getNextDebutantLesson(currentId: string): DebutantLesson | undefined {
  const currentLesson = getDebutantLessonById(currentId);
  if (!currentLesson) return undefined;
  
  return debutantLessons.find(lesson => lesson.level === currentLesson.level + 1);
}

/**
 * Get previous lesson in progression
 */
export function getPreviousDebutantLesson(currentId: string): DebutantLesson | undefined {
  const currentLesson = getDebutantLessonById(currentId);
  if (!currentLesson) return undefined;
  
  return debutantLessons.find(lesson => lesson.level === currentLesson.level - 1);
}

export default debutantLessons;