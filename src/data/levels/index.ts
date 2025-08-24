// Main export file for all lesson levels
import { debutantLessons } from './debutant';
import { intermediaireLessons } from './intermediaire';
import { avanceLessons } from './avance';
import { expertLessons } from './expert';

/**
 * Export all lessons organized by difficulty level
 * This provides a centralized access point for the modular lesson system
 */
export const allLessons = {
  debutant: debutantLessons,
  intermediaire: intermediaireLessons,
  avance: avanceLessons,
  expert: expertLessons
};

/**
 * Get lessons by difficulty level
 * @param difficulty - The difficulty level (debutant, intermediaire, avance)
 * @returns Array of lessons for the specified difficulty
 */
export function getLessonsByDifficulty(difficulty: 'debutant' | 'intermediaire' | 'avance' | 'expert') {
  return allLessons[difficulty] || [];
}

/**
 * Get all lessons as a flat array
 * @returns All lessons from all difficulty levels
 */
export function getAllLessonsFlat() {
  return [
    ...debutantLessons,
    ...intermediaireLessons,
    ...avanceLessons,
    ...expertLessons
  ];
}

export { debutantLessons, intermediaireLessons, avanceLessons, expertLessons };