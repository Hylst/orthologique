import React, { useState } from 'react';
import { FileText, Shield, Heart } from 'lucide-react';
import TermsOfService from './legal/TermsOfService';
import PrivacyPolicy from './legal/PrivacyPolicy';

/**
 * Footer Component
 * Provides discrete links to legal documentation (CGU, Privacy Policy)
 * GDPR-compliant footer with minimal visual impact
 */

const Footer: React.FC = () => {
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const currentYear = new Date().getFullYear();

  return (
    <>
      <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Left side - App info */}
            <div className="flex flex-col md:flex-row items-center gap-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500" />
                <span>
                  Orthologique © {currentYear} - Apprentissage de l'orthographe française
                </span>
              </div>
              <div className="text-xs text-gray-500 md:ml-4">
                Créé par <span className="font-medium text-gray-700">Geoffroy Streit</span>
              </div>
            </div>

            {/* Right side - Legal links */}
            <div className="flex items-center gap-6 text-xs text-gray-500">
              <button
                onClick={() => setShowTerms(true)}
                className="flex items-center gap-1 hover:text-gray-700 transition-colors underline-offset-2 hover:underline"
                aria-label="Consulter les conditions générales d'utilisation"
              >
                <FileText className="w-3 h-3" />
                CGU
              </button>
              
              <button
                onClick={() => setShowPrivacy(true)}
                className="flex items-center gap-1 hover:text-gray-700 transition-colors underline-offset-2 hover:underline"
                aria-label="Consulter la politique de confidentialité"
              >
                <Shield className="w-3 h-3" />
                Confidentialité
              </button>

              <div className="flex items-center gap-1 text-gray-400">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span>Local</span>
              </div>
            </div>
          </div>

          {/* Additional info row */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-gray-400">
              <div className="flex items-center gap-4">
                <span>🔒 Données stockées localement</span>
                <span>🌐 Aucune transmission externe</span>
                <span>✅ Conforme RGPD</span>
              </div>
              
              <div className="flex items-center gap-1">
                <span>Fait avec</span>
                <Heart className="w-3 h-3 text-red-400" />
                <span>pour l'éducation</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Legal Modals */}
      <TermsOfService 
        isOpen={showTerms} 
        onClose={() => setShowTerms(false)} 
      />
      
      <PrivacyPolicy 
        isOpen={showPrivacy} 
        onClose={() => setShowPrivacy(false)} 
      />
    </>
  );
};

export default Footer;