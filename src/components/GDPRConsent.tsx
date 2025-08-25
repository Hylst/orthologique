import React, { useState, useEffect } from 'react';
import { Shield, Cookie, Database, BarChart3, X, Check, Settings } from 'lucide-react';

/**
 * GDPR Consent Management Component
 * Handles user consent for data processing, cookies, and analytics
 * Complies with GDPR Article 7 requirements for valid consent
 */

interface ConsentPreferences {
  essential: boolean; // Always true, cannot be disabled
  functional: boolean; // User preferences, progress saving
  analytics: boolean; // Usage statistics (anonymized)
  marketing: boolean; // Future marketing features
}

interface GDPRConsentProps {
  onConsentGiven: (preferences: ConsentPreferences) => void;
  onConsentDeclined: () => void;
}

const GDPRConsent: React.FC<GDPRConsentProps> = ({ onConsentGiven, onConsentDeclined }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    essential: true,
    functional: true,
    analytics: false,
    marketing: false
  });



  /**
   * Handle consent acceptance with current preferences
   */
  const handleAcceptAll = () => {
    const fullConsent: ConsentPreferences = {
      essential: true,
      functional: true,
      analytics: true,
      marketing: true
    };
    saveConsent(fullConsent);
    onConsentGiven(fullConsent);
  };

  /**
   * Handle consent with custom preferences
   */
  const handleAcceptSelected = () => {
    saveConsent(preferences);
    onConsentGiven(preferences);
  };

  /**
   * Handle consent decline (only essential cookies)
   */
  const handleDecline = () => {
    const essentialOnly: ConsentPreferences = {
      essential: true,
      functional: false,
      analytics: false,
      marketing: false
    };
    saveConsent(essentialOnly);
    onConsentDeclined();
  };

  /**
   * Save consent preferences to localStorage
   */
  const saveConsent = (consentPrefs: ConsentPreferences) => {
    const consentData = {
      preferences: consentPrefs,
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };
    localStorage.setItem('gdpr-consent', JSON.stringify(consentData));
  };

  /**
   * Toggle preference setting
   */
  const togglePreference = (key: keyof ConsentPreferences) => {
    if (key === 'essential') return; // Cannot disable essential cookies
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-800">Protection de vos données</h2>
          </div>
          <button
            onClick={handleDecline}
            className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Fermer et refuser les cookies non essentiels"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {!showDetails ? (
            /* Simple consent view */
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Nous respectons votre vie privée. Cette application utilise des technologies 
                pour améliorer votre expérience d'apprentissage et sauvegarder votre progression.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">Que faisons-nous avec vos données ?</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Sauvegarde de votre progression d'apprentissage</li>
                  <li>• Mémorisation de vos préférences (audio, thème, etc.)</li>
                  <li>• Amélioration de l'application (statistiques anonymes)</li>
                  <li>• Aucune donnée n'est partagée avec des tiers</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAcceptAll}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <Check className="w-4 h-4 inline mr-2" />
                  Accepter tout
                </button>
                <button
                  onClick={() => setShowDetails(true)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  <Settings className="w-4 h-4 inline mr-2" />
                  Personnaliser
                </button>
                <button
                  onClick={handleDecline}
                  className="flex-1 bg-gray-50 text-gray-600 py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Refuser
                </button>
              </div>
            </div>
          ) : (
            /* Detailed consent preferences */
            <div className="space-y-6">
              <div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-blue-600 hover:text-blue-700 text-sm mb-4"
                >
                  ← Retour
                </button>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Personnaliser vos préférences</h3>
              </div>

              {/* Essential Cookies */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-green-600" />
                    <h4 className="font-medium text-gray-800">Cookies essentiels</h4>
                  </div>
                  <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                    Toujours actifs
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Nécessaires au fonctionnement de base de l'application. 
                  Ils ne peuvent pas être désactivés.
                </p>
              </div>

              {/* Functional Cookies */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-blue-600" />
                    <h4 className="font-medium text-gray-800">Cookies fonctionnels</h4>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.functional}
                      onChange={() => togglePreference('functional')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <p className="text-sm text-gray-600">
                  Sauvegarde de vos préférences (thème, audio, progression) pour 
                  améliorer votre expérience.
                </p>
              </div>

              {/* Analytics Cookies */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                    <h4 className="font-medium text-gray-800">Cookies analytiques</h4>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={() => togglePreference('analytics')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <p className="text-sm text-gray-600">
                  Statistiques d'usage anonymes pour améliorer l'application. 
                  Aucune donnée personnelle n'est collectée.
                </p>
              </div>

              {/* Marketing Cookies */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Cookie className="w-5 h-5 text-orange-600" />
                    <h4 className="font-medium text-gray-800">Cookies marketing</h4>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={() => togglePreference('marketing')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <p className="text-sm text-gray-600">
                  Fonctionnalités marketing futures (recommandations personnalisées, 
                  notifications éducatives).
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <button
                  onClick={handleAcceptSelected}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Sauvegarder mes préférences
                </button>
                <button
                  onClick={handleDecline}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cookies essentiels uniquement
                </button>
              </div>
            </div>
          )}

          {/* Legal links */}
          <div className="mt-6 pt-4 border-t text-center">
            <p className="text-xs text-gray-500">
              En continuant, vous acceptez notre{' '}
              <button className="text-blue-600 hover:underline">Politique de confidentialité</button>
              {' '}et nos{' '}
              <button className="text-blue-600 hover:underline">Conditions d'utilisation</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GDPRConsent;

/**
 * Hook to get current consent preferences
 */
export const useGDPRConsent = () => {
  const [consent, setConsent] = useState<ConsentPreferences | null>(null);

  useEffect(() => {
    const consentData = localStorage.getItem('gdpr-consent');
    if (consentData) {
      try {
        const parsed = JSON.parse(consentData);
        setConsent(parsed.preferences);
      } catch (error) {
        console.error('Error parsing consent data:', error);
      }
    }
  }, []);

  return consent;
};

/**
 * Function to check if a specific consent type is granted
 */
export const hasConsent = (type: keyof ConsentPreferences): boolean => {
  const consentData = localStorage.getItem('gdpr-consent');
  if (!consentData) return false;
  
  try {
    const parsed = JSON.parse(consentData);
    return parsed.preferences[type] || false;
  } catch (error) {
    return false;
  }
};

/**
 * Function to update consent preferences
 */
export const updateConsent = (preferences: ConsentPreferences): void => {
  const consentData = {
    preferences,
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  };
  localStorage.setItem('gdpr-consent', JSON.stringify(consentData));
};