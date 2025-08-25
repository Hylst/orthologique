/**
 * Débutant Level Lessons Index
 * Levels 1-5 (CM1-CM2)
 * All lessons focus on orthographe (spelling) fundamentals
 */

import { Lesson } from '../../../types';

// Import all lesson JSON files
import svAccord1 from './orthographe/sv-accord-1.json';
import homophoneA2 from './orthographe/homophone-a-2.json';
import homophoneEstEt3 from './orthographe/homophone-est-et-3.json';
import homophoneSonSont4 from './orthographe/homophone-son-sont-4.json';
import accordGn5 from './orthographe/accord-gn-5.json';

// Export all lessons as complete Lesson objects
export const debutantLessons: Lesson[] = [
  { ...svAccord1, unlocked: true, completed: false } as Lesson,
  { ...homophoneA2, unlocked: false, completed: false } as Lesson,
  { ...homophoneEstEt3, unlocked: false, completed: false } as Lesson,
  { ...homophoneSonSont4, unlocked: false, completed: false } as Lesson,
  { ...accordGn5, unlocked: false, completed: false } as Lesson
];

export default debutantLessons;