/**
 * Intermédiaire Level Lessons Index
 * Levels 6-10 (6ème-5ème)
 * Mixed categories: orthographe, conjugaison, ponctuation
 */

import { Lesson } from '../../../types';

// Import all lesson JSON files
import plurielsNoms6 from './orthographe/pluriels-noms-6.json';
import participePasse7 from './conjugaison/participe-passe-etre-avoir-7.json';
import homophonesComplexes8 from './orthographe/homophones-complexes-8.json';
import ponctuationDialogue9 from './ponctuation/ponctuation-dialogue-9.json';

// Export all lessons as complete Lesson objects
export const intermediaireLessons: Lesson[] = [
  { ...plurielsNoms6, unlocked: false, completed: false } as Lesson,
  { ...participePasse7, unlocked: false, completed: false } as Lesson,
  { ...homophonesComplexes8, unlocked: false, completed: false } as Lesson,
  { ...ponctuationDialogue9, unlocked: false, completed: false } as Lesson
];

export default intermediaireLessons;