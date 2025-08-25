import React from 'react';
import { X, FileText, Calendar, Shield, AlertTriangle } from 'lucide-react';

/**
 * Terms of Service (Conditions Générales d'Utilisation)
 * Legal documentation component for GDPR compliance
 */

interface TermsOfServiceProps {
  isOpen: boolean;
  onClose: () => void;
}

const TermsOfService: React.FC<TermsOfServiceProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gray-50">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-800">
              Conditions Générales d'Utilisation
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="prose max-w-none">
            {/* Last updated */}
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-6 bg-blue-50 p-3 rounded-lg">
              <Calendar className="w-4 h-4" />
              <span>Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</span>
            </div>

            {/* Introduction */}
            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                1. Introduction
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Bienvenue sur Orthologique, une application éducative dédiée à l'apprentissage 
                de l'orthographe française. En utilisant cette application, vous acceptez les 
                présentes Conditions Générales d'Utilisation.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Cette application fonctionne entièrement en local sur votre appareil. 
                Aucune donnée n'est transmise vers des serveurs externes.
              </p>
            </section>

            {/* Service description */}
            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                2. Description du service
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Orthologique propose :
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Des exercices interactifs d'orthographe française</li>
                <li>Un suivi personnalisé de vos progrès</li>
                <li>Des leçons adaptées à différents niveaux</li>
                <li>Un système de récompenses et de motivation</li>
                <li>Une interface accessible et intuitive</li>
              </ul>
            </section>

            {/* User obligations */}
            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                3. Obligations de l'utilisateur
              </h3>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-yellow-800 font-medium mb-2">Utilisation responsable</p>
                    <p className="text-yellow-700 text-sm">
                      Vous vous engagez à utiliser l'application de manière appropriée 
                      et conforme à sa finalité éducative.
                    </p>
                  </div>
                </div>
              </div>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Utiliser l'application uniquement à des fins éducatives</li>
                <li>Ne pas tenter de contourner les mécanismes de sécurité</li>
                <li>Respecter les droits de propriété intellectuelle</li>
                <li>Ne pas utiliser l'application pour des activités illégales</li>
              </ul>
            </section>

            {/* Data and privacy */}
            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                4. Données et confidentialité
              </h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-green-800 mb-2">🔒 Protection de vos données</h4>
                <p className="text-green-700 text-sm">
                  Toutes vos données sont stockées localement sur votre appareil. 
                  Aucune information personnelle n'est transmise à des tiers.
                </p>
              </div>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Stockage local uniquement (localStorage du navigateur)</li>
                <li>Aucune transmission de données vers des serveurs</li>
                <li>Contrôle total sur vos informations personnelles</li>
                <li>Possibilité d'export et de suppression à tout moment</li>
              </ul>
            </section>

            {/* Intellectual property */}
            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                5. Propriété intellectuelle
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Le contenu éducatif, les exercices, les interfaces et tous les éléments 
                de l'application sont protégés par les droits de propriété intellectuelle.
              </p>
              <p className="text-gray-700 leading-relaxed">
                L'utilisation de l'application vous confère un droit d'usage personnel 
                et non-commercial du contenu.
              </p>
            </section>

            {/* Liability */}
            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                6. Responsabilité
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                L'application est fournie "en l'état". Nous nous efforçons de maintenir 
                un service de qualité, mais ne pouvons garantir :
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>L'absence d'interruptions ou d'erreurs</li>
                <li>La compatibilité avec tous les appareils</li>
                <li>L'exactitude absolue de tous les contenus</li>
              </ul>
            </section>

            {/* Modifications */}
            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                7. Modifications des CGU
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Ces conditions peuvent être modifiées à tout moment. Les modifications 
                prendront effet dès leur publication dans l'application. Il est recommandé 
                de consulter régulièrement cette page.
              </p>
            </section>

            {/* Applicable law */}
            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                8. Droit applicable
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Les présentes conditions sont régies par le droit français. 
                En cas de litige, les tribunaux français seront compétents.
              </p>
            </section>

            {/* Contact */}
            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                9. Contact
              </h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 mb-2">
                  Pour toute question concernant ces conditions d'utilisation :
                </p>
                <p className="text-blue-700 text-sm">
                  Vous pouvez nous contacter via les paramètres de l'application 
                  ou consulter la documentation d'aide intégrée.
                </p>
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 px-6 py-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              En continuant à utiliser l'application, vous acceptez ces conditions.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;