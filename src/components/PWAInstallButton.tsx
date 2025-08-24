import React, { useState, useEffect } from 'react';
import { Download, Smartphone, Check } from 'lucide-react';
import { pwaManager } from '../utils/pwa';

const PWAInstallButton: React.FC = () => {
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // Vérifier le statut initial
    setCanInstall(pwaManager.canInstall());
    setIsInstalled(pwaManager.isAppInstalled());

    // Écouter les changements
    const checkStatus = () => {
      setCanInstall(pwaManager.canInstall());
      setIsInstalled(pwaManager.isAppInstalled());
    };

    // Vérifier périodiquement
    const interval = setInterval(checkStatus, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      const success = await pwaManager.installApp();
      if (success) {
        setIsInstalled(true);
        setCanInstall(false);
      }
    } catch (error) {
      console.error('Erreur lors de l\'installation:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  // Ne pas afficher le bouton si l'app est déjà installée
  if (isInstalled) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-800 rounded-lg text-sm">
        <Check className="w-4 h-4" />
        <span>Application installée</span>
      </div>
    );
  }

  // Ne pas afficher le bouton si l'installation n'est pas possible
  if (!canInstall) {
    return null;
  }

  return (
    <button
      onClick={handleInstall}
      disabled={isInstalling}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
    >
      {isInstalling ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>Installation...</span>
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          <span>Installer l'app</span>
        </>
      )}
    </button>
  );
};

export default PWAInstallButton;