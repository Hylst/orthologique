import React from 'react';
import { X, Shield, Database, Eye, Download, Trash2, Calendar } from 'lucide-react';

/**
 * Privacy Policy (Politique de Confidentialité)
 * GDPR-compliant privacy policy component
 */

interface PrivacyPolicyProps {
  isOpen: boolean;
  onClose: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gray-50">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-bold text-gray-800">
              Politique de Confidentialité
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
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-6 bg-green-50 p-3 rounded-lg">
              <Calendar className="w-4 h-4" />
              <span>Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</span>
            </div>

            {/* Introduction */}
            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                1. Introduction
              </h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-green-800 mb-2">🔒 Engagement de confidentialité</h4>
                <p className="text-green-700 text-sm">
                  Orthologique respecte votre vie privée. Cette application fonctionne 
                  entièrement en local, sans transmission de données vers des serveurs externes.
                </p>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Cette politique explique comment nous traitons vos informations personnelles 
                conformément au Règlement Général sur la Protection des Données (RGPD).
              </p>
            </section>

            {/* Data collection */}
            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-600" />
                2. Données collectées
              </h3>
              
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-2">📝 Données de profil (optionnelles)</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4 text-sm">
                    <li><strong>Nom :</strong> Pour personnaliser votre expérience</li>
                    <li><strong>Avatar :</strong> Pour identifier visuellement votre profil</li>
                    <li><strong>Email :</strong> Uniquement si vous choisissez le mode complet (optionnel)</li>
                    <li><strong>Âge :</strong> Pour adapter le contenu (optionnel)</li>
                    <li><strong>Notes personnelles :</strong> Vos propres annotations (optionnel)</li>
                  </ul>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-2">📊 Données d'apprentissage</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4 text-sm">
                    <li>Progression dans les exercices</li>
                    <li>Scores et statistiques de performance</li>
                    <li>Préférences d'interface (thème, taille de police, etc.)</li>
                    <li>Historique des sessions d'apprentissage</li>
                  </ul>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-2">⚙️ Données techniques</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4 text-sm">
                    <li>Préférences de l'application (audio, notifications)</li>
                    <li>Dates de création et dernière connexion</li>
                    <li>Paramètres d'accessibilité</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Data usage */}
            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5 text-purple-600" />
                3. Utilisation des données
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Vos données sont utilisées exclusivement pour :
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Personnaliser votre expérience d'apprentissage</li>
                <li>Suivre vos progrès et adapter les exercices</li>
                <li>Sauvegarder vos préférences d'interface</li>
                <li>Permettre l'export/import de vos données</li>
              </ul>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <p className="text-blue-800 font-medium mb-2">✅ Ce que nous ne faisons PAS :</p>
                <ul className="list-disc list-inside text-blue-700 space-y-1 ml-4 text-sm">
                  <li>Transmettre vos données à des tiers</li>
                  <li>Utiliser vos données à des fins commerciales</li>
                  <li>Analyser vos données à des fins de profilage</li>
                  <li>Stocker vos données sur des serveurs externes</li>
                </ul>
              </div>
            </section>

            {/* Data storage */}
            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                4. Stockage des données
              </h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-yellow-800 mb-2">💾 Stockage local uniquement</h4>
                <p className="text-yellow-700 text-sm">
                  Toutes vos données sont stockées dans le localStorage de votre navigateur, 
                  directement sur votre appareil.
                </p>
              </div>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li><strong>Localisation :</strong> localStorage du navigateur web</li>
                <li><strong>Accès :</strong> Vous seul avez accès à ces données</li>
                <li><strong>Persistance :</strong> Les données restent jusqu'à suppression manuelle</li>
                <li><strong>Sécurité :</strong> Protégées par les mécanismes de sécurité du navigateur</li>
              </ul>
            </section>

            {/* GDPR rights */}
            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                5. Vos droits RGPD
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Conformément au RGPD, vous disposez des droits suivants :
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-blue-600" />
                    Droit d'accès
                  </h4>
                  <p className="text-gray-700 text-sm">
                    Consultez toutes vos données via l'interface de l'application 
                    ou exportez-les au format JSON.
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                    <Download className="w-4 h-4 text-green-600" />
                    Droit à la portabilité
                  </h4>
                  <p className="text-gray-700 text-sm">
                    Exportez vos données dans un format standard (JSON) 
                    pour les utiliser ailleurs.
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-red-600" />
                    Droit à l'effacement
                  </h4>
                  <p className="text-gray-700 text-sm">
                    Supprimez définitivement toutes vos données 
                    via les paramètres de l'application.
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-2">✏️ Droit de rectification</h4>
                  <p className="text-gray-700 text-sm">
                    Modifiez vos informations personnelles 
                    à tout moment dans votre profil.
                  </p>
                </div>
              </div>
            </section>

            {/* Cookies */}
            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                6. Cookies et technologies similaires
              </h3>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-orange-800 mb-2">🍪 Utilisation minimale</h4>
                <p className="text-orange-700 text-sm">
                  Cette application utilise uniquement le localStorage pour sauvegarder 
                  vos données. Aucun cookie de suivi n'est utilisé.
                </p>
              </div>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li><strong>localStorage :</strong> Sauvegarde de vos données et préférences</li>
                <li><strong>Pas de cookies tiers :</strong> Aucun service externe n'est utilisé</li>
                <li><strong>Pas de tracking :</strong> Aucun suivi de votre activité</li>
              </ul>
            </section>

            {/* Data security */}
            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                7. Sécurité des données
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                La sécurité de vos données est assurée par :
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Stockage local uniquement (pas de transmission réseau)</li>
                <li>Chiffrement natif du localStorage par le navigateur</li>
                <li>Isolation des données par domaine web</li>
                <li>Contrôle total de l'utilisateur sur ses données</li>
              </ul>
            </section>

            {/* Updates */}
            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                8. Modifications de cette politique
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Cette politique peut être mise à jour pour refléter les changements 
                dans l'application ou la réglementation. Les modifications importantes 
                seront signalées dans l'interface de l'application.
              </p>
            </section>

            {/* Contact */}
            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                9. Contact et réclamations
              </h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 mb-2">
                  Pour toute question sur cette politique de confidentialité :
                </p>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• Consultez l'aide intégrée à l'application</li>
                  <li>• Utilisez les paramètres de contact dans l'application</li>
                  <li>• Vous pouvez également exercer vos droits auprès de la CNIL</li>
                </ul>
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 px-6 py-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Vos données vous appartiennent. Vous gardez le contrôle total.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;