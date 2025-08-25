// Utilitaires PWA pour OrthoLogique
import type { NotificationAction } from '../types';

// Extended NotificationOptions to include vibrate property
interface ExtendedNotificationOptions extends NotificationOptions {
  vibrate?: number[];
  actions?: NotificationAction[];
}

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

class PWAManager {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private isInstalled = false;
  private swRegistration: ServiceWorkerRegistration | null = null;

  constructor() {
    this.init();
  }

  private async init() {
    // Attendre que le document soit complètement chargé
    if (document.readyState !== 'complete') {
      await new Promise(resolve => {
        window.addEventListener('load', resolve, { once: true });
      });
    }
    
    // Vérifier si l'app est déjà installée
    this.checkInstallStatus();
    
    // Enregistrer le Service Worker
    await this.registerServiceWorker();
    
    // Écouter l'événement d'installation
    this.listenForInstallPrompt();
    
    // Vérifier les mises à jour
    this.checkForUpdates();
  }

  private checkInstallStatus() {
    // Vérifier si l'app est lancée en mode standalone
    this.isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                      (window.navigator as any).standalone ||
                      document.referrer.includes('android-app://');
  }

  private async registerServiceWorker() {
    if ('serviceWorker' in navigator && document.readyState === 'complete') {
      try {
        // Wait a bit to ensure the document is fully loaded
        await new Promise(resolve => setTimeout(resolve, 100));
        
        this.swRegistration = await navigator.serviceWorker.register('/sw.js');
        console.log('[PWA] Service Worker enregistré:', this.swRegistration);
        
        // Écouter les mises à jour du SW
        this.swRegistration.addEventListener('updatefound', () => {
          const newWorker = this.swRegistration!.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                this.showUpdateNotification();
              }
            });
          }
        });
      } catch (error) {
        // Détecter l'environnement StackBlitz ou similaire
        const isStackBlitz = window.location.hostname.includes('stackblitz') || 
                           window.location.hostname.includes('webcontainer') ||
                           (error as Error).message.includes('not yet supported');
        
        // Vérifier si c'est une erreur InvalidStateError
        const isInvalidStateError = (error as Error).name === 'InvalidStateError' ||
                                   (error as Error).message.includes('invalid state');
        
        if (isStackBlitz) {
          console.warn('[PWA] Service Workers ne sont pas supportés dans cet environnement de développement (StackBlitz/WebContainer). Les fonctionnalités PWA seront limitées.');
        } else if (isInvalidStateError) {
          console.warn('[PWA] Service Worker ne peut pas être enregistré dans l\'état actuel du document. Ceci est normal dans certains contextes.');
        } else {
          console.error('[PWA] Erreur lors de l\'enregistrement du SW:', error);
        }
      }
    }
  }

  private listenForInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault();
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      this.showInstallBanner();
    });

    window.addEventListener('appinstalled', () => {
      console.log('[PWA] Application installée');
      this.isInstalled = true;
      this.hideInstallBanner();
      this.showInstallSuccessMessage();
    });
  }

  private checkForUpdates() {
    if (this.swRegistration) {
      setInterval(() => {
        this.swRegistration!.update();
      }, 60000); // Vérifier toutes les minutes
    }
  }

  // Méthodes publiques
  public async installApp(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false;
    }

    try {
      await this.deferredPrompt.prompt();
      const choiceResult = await this.deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('[PWA] Installation acceptée');
        this.deferredPrompt = null;
        return true;
      } else {
        console.log('[PWA] Installation refusée');
        return false;
      }
    } catch (error) {
      console.error('[PWA] Erreur lors de l\'installation:', error);
      return false;
    }
  }

  public canInstall(): boolean {
    return this.deferredPrompt !== null && !this.isInstalled;
  }

  public isAppInstalled(): boolean {
    return this.isInstalled;
  }

  public async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  public async showNotification(title: string, options: ExtendedNotificationOptions = {}, actions?: NotificationAction[]) {
    if (!await this.requestNotificationPermission()) {
      return;
    }

    const defaultOptions: ExtendedNotificationOptions = {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      ...options
    };

    if (this.swRegistration) {
      // Actions are only supported for persistent notifications via service worker
      if (actions && actions.length > 0) {
        defaultOptions.actions = actions;
      }
      await this.swRegistration.showNotification(title, defaultOptions);
    } else {
      // Regular notifications don't support actions, so we exclude them
      const { actions: _, ...optionsWithoutActions } = defaultOptions;
      new Notification(title, optionsWithoutActions);
    }
  }

  private showInstallBanner() {
    // Créer une bannière d'installation
    const banner = document.createElement('div');
    banner.id = 'pwa-install-banner';
    banner.className = 'fixed bottom-4 left-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50 flex items-center justify-between';
    banner.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
          <span class="text-2xl">💡</span>
        </div>
        <div>
          <p class="font-medium">Installer OrthoLogique</p>
          <p class="text-sm opacity-90">Accès rapide depuis votre écran d'accueil</p>
        </div>
      </div>
      <div class="flex gap-2">
        <button id="pwa-install-btn" class="bg-white text-blue-600 px-4 py-2 rounded font-medium hover:bg-gray-100 transition-colors">
          Installer
        </button>
        <button id="pwa-dismiss-btn" class="text-white opacity-75 hover:opacity-100 p-2">
          ✕
        </button>
      </div>
    `;

    document.body.appendChild(banner);

    // Gérer les clics
    document.getElementById('pwa-install-btn')?.addEventListener('click', () => {
      this.installApp();
    });

    document.getElementById('pwa-dismiss-btn')?.addEventListener('click', () => {
      this.hideInstallBanner();
    });
  }

  private hideInstallBanner() {
    const banner = document.getElementById('pwa-install-banner');
    if (banner) {
      banner.remove();
    }
  }

  private showInstallSuccessMessage() {
    this.showNotification('OrthoLogique installé !', {
      body: 'L\'application est maintenant disponible sur votre écran d\'accueil.',
      tag: 'install-success'
    });
  }

  private showUpdateNotification() {
    const updateBanner = document.createElement('div');
    updateBanner.id = 'pwa-update-banner';
    updateBanner.className = 'fixed top-4 left-4 right-4 bg-green-600 text-white p-4 rounded-lg shadow-lg z-50 flex items-center justify-between';
    updateBanner.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
          <span class="text-2xl">🔄</span>
        </div>
        <div>
          <p class="font-medium">Mise à jour disponible</p>
          <p class="text-sm opacity-90">Une nouvelle version d'OrthoLogique est prête</p>
        </div>
      </div>
      <div class="flex gap-2">
        <button id="pwa-update-btn" class="bg-white text-green-600 px-4 py-2 rounded font-medium hover:bg-gray-100 transition-colors">
          Mettre à jour
        </button>
        <button id="pwa-update-dismiss-btn" class="text-white opacity-75 hover:opacity-100 p-2">
          ✕
        </button>
      </div>
    `;

    document.body.appendChild(updateBanner);

    document.getElementById('pwa-update-btn')?.addEventListener('click', () => {
      window.location.reload();
    });

    document.getElementById('pwa-update-dismiss-btn')?.addEventListener('click', () => {
      updateBanner.remove();
    });
  }
}

// Instance globale
export const pwaManager = new PWAManager();

// Fonctions utilitaires
export const installApp = () => pwaManager.installApp();
export const canInstall = () => pwaManager.canInstall();
export const isAppInstalled = () => pwaManager.isAppInstalled();
export const showNotification = (title: string, options?: ExtendedNotificationOptions, actions?: NotificationAction[]) => 
  pwaManager.showNotification(title, options, actions);
export const requestNotificationPermission = () => pwaManager.requestNotificationPermission();