import { pwaManager } from './pwa';

export interface NotificationConfig {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  vibrate?: number[];
  actions?: NotificationAction[];
}

export class NotificationManager {
  private static instance: NotificationManager;
  private permission: NotificationPermission = 'default';

  private constructor() {
    this.checkPermission();
  }

  public static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  private checkPermission() {
    if ('Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  public async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Ce navigateur ne supporte pas les notifications');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    if (this.permission === 'denied') {
      return false;
    }

    try {
      this.permission = await Notification.requestPermission();
      return this.permission === 'granted';
    } catch (error) {
      console.error('Erreur lors de la demande de permission:', error);
      return false;
    }
  }

  public async showNotification(config: NotificationConfig): Promise<boolean> {
    if (!await this.requestPermission()) {
      return false;
    }

    const options: NotificationOptions = {
      body: config.body,
      icon: config.icon || '/icons/icon-192x192.png',
      badge: config.badge || '/icons/icon-72x72.png',
      tag: config.tag,
      requireInteraction: config.requireInteraction || false,
      silent: config.silent || false,
      vibrate: config.vibrate || [100, 50, 100],
      actions: config.actions || []
    };

    try {
      await pwaManager.showNotification(config.title, options);
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'affichage de la notification:', error);
      return false;
    }
  }

  // Notifications prédéfinies pour OrthoLogique
  public async showLessonCompleted(lessonTitle: string, score: number): Promise<boolean> {
    const emoji = score >= 90 ? '🏆' : score >= 70 ? '⭐' : '💪';
    return this.showNotification({
      title: `${emoji} Leçon terminée !`,
      body: `Vous avez obtenu ${score}% à "${lessonTitle}"`,
      tag: 'lesson-completed',
      actions: [
        {
          action: 'continue',
          title: 'Continuer',
          icon: '/icons/icon-96x96.png'
        },
        {
          action: 'review',
          title: 'Réviser',
          icon: '/icons/icon-96x96.png'
        }
      ]
    });
  }

  public async showDailyReminder(): Promise<boolean> {
    return this.showNotification({
      title: '📚 Votre dose quotidienne d\'orthographe !',
      body: 'Continuez votre apprentissage avec OrthoLogique',
      tag: 'daily-reminder',
      requireInteraction: true,
      actions: [
        {
          action: 'start-lesson',
          title: 'Commencer une leçon',
          icon: '/icons/icon-96x96.png'
        },
        {
          action: 'dismiss',
          title: 'Plus tard',
          icon: '/icons/icon-96x96.png'
        }
      ]
    });
  }

  public async showStreakMilestone(streak: number): Promise<boolean> {
    return this.showNotification({
      title: `🔥 ${streak} jours consécutifs !`,
      body: 'Félicitations pour votre régularité dans l\'apprentissage',
      tag: 'streak-milestone',
      requireInteraction: true,
      vibrate: [200, 100, 200, 100, 200]
    });
  }

  public async showNewContentAvailable(): Promise<boolean> {
    return this.showNotification({
      title: '🆕 Nouveau contenu disponible !',
      body: 'De nouvelles leçons vous attendent dans OrthoLogique',
      tag: 'new-content',
      actions: [
        {
          action: 'explore',
          title: 'Découvrir',
          icon: '/icons/icon-96x96.png'
        }
      ]
    });
  }

  public async showOfflineDataSaved(): Promise<boolean> {
    return this.showNotification({
      title: '💾 Données sauvegardées',
      body: 'Votre progression a été sauvegardée localement',
      tag: 'offline-save',
      silent: true
    });
  }

  public hasPermission(): boolean {
    return this.permission === 'granted';
  }

  public isSupported(): boolean {
    return 'Notification' in window;
  }
}

// Instance globale
export const notificationManager = NotificationManager.getInstance();

// Fonctions utilitaires
export const requestNotificationPermission = () => notificationManager.requestPermission();
export const showNotification = (config: NotificationConfig) => notificationManager.showNotification(config);
export const showLessonCompleted = (lessonTitle: string, score: number) => 
  notificationManager.showLessonCompleted(lessonTitle, score);
export const showDailyReminder = () => notificationManager.showDailyReminder();
export const showStreakMilestone = (streak: number) => notificationManager.showStreakMilestone(streak);
export const showNewContentAvailable = () => notificationManager.showNewContentAvailable();
export const showOfflineDataSaved = () => notificationManager.showOfflineDataSaved();