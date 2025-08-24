import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Cloud, CloudOff } from 'lucide-react';

const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 5000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showNotification && isOnline) {
    return null;
  }

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
      showNotification ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
    }`}>
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${
        isOnline 
          ? 'bg-green-600 text-white' 
          : 'bg-orange-600 text-white'
      }`}>
        <div className="flex items-center gap-2">
          {isOnline ? (
            <>
              <Wifi className="w-5 h-5" />
              <Cloud className="w-4 h-4" />
            </>
          ) : (
            <>
              <WifiOff className="w-5 h-5" />
              <CloudOff className="w-4 h-4" />
            </>
          )}
        </div>
        <div>
          <p className="font-medium">
            {isOnline ? 'Connexion rétablie' : 'Mode hors ligne'}
          </p>
          <p className="text-sm opacity-90">
            {isOnline 
              ? 'Toutes les fonctionnalités sont disponibles'
              : 'Vos données sont sauvegardées localement'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default OfflineIndicator;