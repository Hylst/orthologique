import { UserProgress, Lesson, UserProfile } from '../types';
import { saveProgress, loadProgress, createDefaultProgress, getCurrentUser } from './storage';

export class ProgressManager {
  private userProgress: UserProgress;

  constructor() {
    const currentUser = getCurrentUser();
    this.userProgress = loadProgress() || (currentUser ? createDefaultProgress(currentUser) : this.createGuestProgress());
  }

  private createGuestProgress(): UserProgress {
    const guestProfile: UserProfile = {
      id: 'guest',
      name: 'Invité',
      email: '',
      age: null,
      avatar: '👤',
      notes: '',
      preferences: {
        audioEnabled: true,
        speechRate: 0.8,
        fontSize: 'medium',
        theme: 'light',
        notifications: true,
      },
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };
    
    return createDefaultProgress(guestProfile);
  }

  /**
   * Calcule le score de réussite moyen basé sur tous les modules terminés
   */
  calculateAverageScore(): number {
    const scores = Object.values(this.userProgress.scores);
    if (scores.length === 0) return 0;
    
    const total = scores.reduce((sum, score) => sum + score, 0);
    return Math.round(total / scores.length);
  }

  /**
   * Vérifie si un module peut être débloqué
   */
  canUnlockLesson(lessonId: string, lessons: Lesson[]): boolean {
    const lesson = lessons.find(l => l.id === lessonId);
    if (!lesson) return false;

    // Le premier module est toujours débloqué
    if (lesson.level === 1) return true;

    // Vérifier les prérequis spécifiques s'ils existent
    if (lesson.prerequisites && lesson.prerequisites.length > 0) {
      return lesson.prerequisites.every(prereqId => 
        this.isLessonCompleted(prereqId) && 
        this.hasPassingScore(prereqId, 70)
      );
    }
    // Trouve le module précédent
    const previousLesson = lessons.find(l => l.level === lesson.level - 1);
    if (!previousLesson) return false;

    // Vérifie si le module précédent est terminé avec un score suffisant
    return this.isLessonCompleted(previousLesson.id) && 
           this.hasPassingScore(previousLesson.id, previousLesson.passingScore || 70);
  }

  /**
   * Vérifie si une leçon est terminée
   */
  isLessonCompleted(lessonId: string): boolean {
    return this.userProgress.completedLessons.includes(lessonId);
  }

  /**
   * Vérifie si le score d'une leçon atteint le seuil requis
   */
  hasPassingScore(lessonId: string, passingScore: number = 70): boolean {
    const score = this.userProgress.scores[lessonId];
    return score !== undefined && score >= passingScore;
  }

  /**
   * Marque une leçon comme terminée avec un score
   */
  completeLesson(lessonId: string, score: number): void {
    // Ajoute la leçon aux leçons terminées si pas déjà présente
    if (!this.userProgress.completedLessons.includes(lessonId)) {
      this.userProgress.completedLessons.push(lessonId);
    }

    // Met à jour le score (garde le meilleur score)
    const currentScore = this.userProgress.scores[lessonId] || 0;
    this.userProgress.scores[lessonId] = Math.max(currentScore, score);

    // Met à jour le score total
    this.userProgress.totalScore = this.calculateTotalScore();

    // Sauvegarde
    this.saveProgress();
  }

  /**
   * Calcule le score total basé sur tous les scores obtenus
   */
  private calculateTotalScore(): number {
    const scores = Object.values(this.userProgress.scores);
    return scores.reduce((sum, score) => sum + score, 0);
  }

  /**
   * Met à jour le nom d'utilisateur
   */
  updateUserProfile(profile: UserProfile): void {
    this.userProgress.userName = profile.name;
    this.userProgress.userProfile = profile;
    this.saveProgress();
  }

  /**
   * Réinitialise complètement la progression
   */
  resetProgress(keepProfile: boolean = true): void {
    const userProfile = keepProfile ? this.userProgress.userProfile : getCurrentUser();
    if (userProfile) {
      this.userProgress = createDefaultProgress(userProfile);
    } else {
      this.userProgress = this.createGuestProgress();
    }
    this.saveProgress();
  }

  /**
   * Met à jour la dernière position
   */
  updateLastPosition(lessonId: string): void {
    this.userProgress.lastPosition = lessonId;
    this.saveProgress();
  }

  /**
   * Sauvegarde la progression
   */
  private saveProgress(): void {
    saveProgress(this.userProgress);
  }

  /**
   * Retourne la progression actuelle
   */
  getProgress(): UserProgress {
    return { ...this.userProgress };
  }

  /**
   * Calcule les statistiques de progression
   */
  getProgressStats(lessons: Lesson[]) {
    const totalLessons = lessons.length;
    const completedCount = this.userProgress.completedLessons.length;
    const averageScore = this.calculateAverageScore();
    const progressPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    return {
      totalLessons,
      completedCount,
      averageScore,
      progressPercentage,
      totalScore: this.userProgress.totalScore
    };
  }

  /**
   * Détermine la prochaine leçon à faire
   */
  getNextLesson(lessons: Lesson[]): Lesson | null {
    // Trouve la première leçon non terminée qui peut être débloquée
    for (const lesson of lessons.sort((a, b) => a.level - b.level)) {
      if (!this.isLessonCompleted(lesson.id) && this.canUnlockLesson(lesson.id, lessons)) {
        return lesson;
      }
    }
    return null;
  }

  /**
   * Vérifie si l'utilisateur peut accéder à une leçon spécifique
   */
  canAccessLesson(lessonId: string, lessons: Lesson[]): boolean {
    return this.canUnlockLesson(lessonId, lessons);
  }
}