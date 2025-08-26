/**
 * Expert level lessons export
 * Contains the most advanced French grammar, conjugation and punctuation lessons
 */

// Orthographe lessons
import adjectifCouleur14 from './orthographe/adjectif-couleur-14.json';
import homophonesAvances15 from './orthographe/homophones-avances-15.json';

// Conjugaison lessons
import subjonctifPresent16 from './conjugaison/subjonctif-present-16.json';
import conditionnelModesTemps17 from './conjugaison/conditionnel-modes-temps-17.json';
import imperatifOrdreConseil18 from './conjugaison/imperatif-ordre-conseil-18.json';
import participePassePronominaux19 from './conjugaison/participe-passe-pronominaux-19.json';
import tempsComposesAvances20 from './conjugaison/temps-composes-avances-20.json';

// Ponctuation lessons
import ponctuationAvancee24 from './ponctuation/ponctuation-avancee-24.json';

/**
 * Array of all expert level lessons (levels 14-24)
 * These lessons target advanced high school students and adults
 */
export const expertLessons = [
  adjectifCouleur14,
  homophonesAvances15,
  subjonctifPresent16,
  conditionnelModesTemps17,
  imperatifOrdreConseil18,
  participePassePronominaux19,
  tempsComposesAvances20,
  ponctuationAvancee24
];

export default expertLessons;

/**
 * Get expert lessons by category
 * @param category - The lesson category to filter by
 * @returns Array of lessons matching the category
 */
export function getExpertLessonsByCategory(category: string) {
  return expertLessons.filter(lesson => lesson.category === category);
}

/**
 * Get expert lesson by ID
 * @param id - The lesson ID to find
 * @returns The lesson object or undefined if not found
 */
export function getExpertLessonById(id: string) {
  return expertLessons.find(lesson => lesson.id === id);
}