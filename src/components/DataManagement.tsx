import React, { useState } from 'react';
import { Download, Upload, Trash2, AlertTriangle, CheckCircle, Shield, Database } from 'lucide-react';
import { UserProfile, UserProgress } from '../types';
import { 
  importUserData, 
  getAllUserProfiles, 
  getUserProgress, 
  clearAllData,
  getCurrentUser,
  setCurrentUser
} from '../utils/storage';

/**
 * Data Management Component
 * Handles GDPR compliance: Right to be forgotten, Data portability
 * Complete import/export functionality with data validation
 */

interface DataManagementProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChange?: () => void;
}

interface ExportData {
  profiles: UserProfile[];
  progress: Record<string, UserProgress>;
  exportDate: string;
  version: string;
}

const DataManagement: React.FC<DataManagementProps> = ({ 
  isOpen, 
  onClose, 
  onDataChange 
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import' | 'delete'>('export');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  /**
   * Export all user data to JSON format
   */
  const handleExportData = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      // Get all data
      const profiles = getAllUserProfiles();
      const progressData: Record<string, UserProgress> = {};
      
      // Get progress for each profile
      profiles.forEach(profile => {
        const progress = getUserProgress(profile.id);
        if (progress) {
          progressData[profile.id] = progress;
        }
      });

      // Create export object
      const exportData: ExportData = {
        profiles,
        progress: progressData,
        exportDate: new Date().toISOString(),
        version: '1.0.0'
      };

      // Create and download file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `orthologique-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setMessage({
        type: 'success',
        text: `Données exportées avec succès ! ${profiles.length} profil(s) et leurs progrès ont été sauvegardés.`
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Erreur lors de l\'export des données. Veuillez réessayer.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Import user data from JSON file
   */
  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const text = await file.text();
      const importData: ExportData = JSON.parse(text);

      // Validate import data structure
      if (!importData.profiles || !Array.isArray(importData.profiles)) {
        throw new Error('Format de fichier invalide : profils manquants');
      }

      if (!importData.progress || typeof importData.progress !== 'object') {
        throw new Error('Format de fichier invalide : données de progrès manquantes');
      }

      // Validate each profile
      for (const profile of importData.profiles) {
        if (!profile.id || !profile.name || !profile.createdAt) {
          throw new Error('Format de profil invalide détecté');
        }
      }

      // Import profiles
      let importedProfiles = 0;
      let importedProgress = 0;
      const currentUser = getCurrentUser();

      for (const profile of importData.profiles) {
        try {
          // Use the import function from storage utils
          const success = importUserData(JSON.stringify({
            profile,
            progress: importData.progress[profile.id]
          }));
          
          if (success) {
            importedProfiles++;
            if (importData.progress[profile.id]) {
              importedProgress++;
            }
          }
        } catch (profileError) {
          console.warn(`Erreur lors de l'import du profil ${profile.name}:`, profileError);
        }
      }

      // If no current user, set the first imported profile as current
      if (!currentUser && importData.profiles.length > 0) {
        setCurrentUser(importData.profiles[0]);
      }

      setMessage({
        type: 'success',
        text: `Import réussi ! ${importedProfiles} profil(s) et ${importedProgress} progression(s) importés.`
      });

      // Notify parent component of data change
      if (onDataChange) {
        onDataChange();
      }

      // Reset file input
      event.target.value = '';
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Erreur lors de l\'import des données'
      });
      event.target.value = '';
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Delete all user data (Right to be forgotten)
   */
  const handleDeleteAllData = async () => {
    if (confirmDelete !== 'SUPPRIMER') {
      setMessage({
        type: 'error',
        text: 'Veuillez taper "SUPPRIMER" pour confirmer la suppression définitive.'
      });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      // Clear all data from localStorage
      clearAllData();
      
      setMessage({
        type: 'success',
        text: 'Toutes vos données ont été supprimées définitivement. La page va se recharger.'
      });

      // Notify parent component
      if (onDataChange) {
        onDataChange();
      }

      // Reload page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Erreur lors de la suppression des données. Veuillez réessayer.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get data statistics
   */
  const getDataStats = () => {
    const profiles = getAllUserProfiles();
    let totalProgress = 0;
    
    profiles.forEach(profile => {
      const progress = getUserProgress(profile.id);
      if (progress) {
        totalProgress += progress.completedLessons.length;
      }
    });

    return {
      profileCount: profiles.length,
      progressCount: totalProgress
    };
  };

  const stats = getDataStats();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gray-50">
          <div className="flex items-center gap-3">
            <Database className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-800">
              Gestion des données
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        {/* Data stats */}
        <div className="p-6 bg-blue-50 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-blue-800 mb-1">Vos données actuelles</h3>
              <p className="text-sm text-blue-700">
                {stats.profileCount} profil(s) • {stats.progressCount} progression(s) sauvegardées
              </p>
            </div>
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          {[
            { id: 'export', label: 'Exporter', icon: Download },
            { id: 'import', label: 'Importer', icon: Upload },
            { id: 'delete', label: 'Supprimer', icon: Trash2 }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === id
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-300px)]">
          {/* Message display */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg border ${
              message.type === 'success' 
                ? 'bg-green-50 border-green-200 text-green-800'
                : message.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-800'
                : 'bg-blue-50 border-blue-200 text-blue-800'
            }`}>
              <div className="flex items-start gap-2">
                {message.type === 'success' && <CheckCircle className="w-5 h-5 mt-0.5" />}
                {message.type === 'error' && <AlertTriangle className="w-5 h-5 mt-0.5" />}
                <p className="text-sm">{message.text}</p>
              </div>
            </div>
          )}

          {/* Export tab */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Exporter vos données
                </h3>
                <p className="text-sm text-green-700 mb-4">
                  Téléchargez toutes vos données dans un fichier JSON standard. 
                  Cela inclut vos profils, progrès, préférences et statistiques.
                </p>
                <ul className="text-sm text-green-700 space-y-1 mb-4">
                  <li>✅ Tous les profils utilisateur</li>
                  <li>✅ Progression dans les exercices</li>
                  <li>✅ Préférences et paramètres</li>
                  <li>✅ Statistiques d'apprentissage</li>
                </ul>
                <button
                  onClick={handleExportData}
                  disabled={isLoading || stats.profileCount === 0}
                  className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Export en cours...' : 'Télécharger mes données'}
                </button>
              </div>
            </div>
          )}

          {/* Import tab */}
          {activeTab === 'import' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Importer vos données
                </h3>
                <p className="text-sm text-blue-700 mb-4">
                  Restaurez vos données à partir d'un fichier d'export précédent. 
                  Les données existantes seront préservées.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                    <p className="text-sm text-yellow-800">
                      Seuls les fichiers JSON d'export d'Orthologique sont acceptés. 
                      Les profils avec des IDs existants seront mis à jour.
                    </p>
                  </div>
                </div>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  disabled={isLoading}
                  className="w-full p-2 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>
          )}

          {/* Delete tab */}
          {activeTab === 'delete' && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-medium text-red-800 mb-2 flex items-center gap-2">
                  <Trash2 className="w-5 h-5" />
                  Droit à l'oubli (RGPD)
                </h3>
                <p className="text-sm text-red-700 mb-4">
                  Supprimez définitivement toutes vos données personnelles. 
                  Cette action est irréversible.
                </p>
                
                <div className="bg-red-100 border border-red-300 rounded p-3 mb-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-red-800 font-medium mb-1">
                        Attention : Suppression définitive
                      </p>
                      <ul className="text-sm text-red-700 space-y-1">
                        <li>• Tous vos profils seront supprimés</li>
                        <li>• Toute votre progression sera perdue</li>
                        <li>• Vos préférences seront effacées</li>
                        <li>• Cette action ne peut pas être annulée</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Supprimer toutes mes données
                  </button>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-red-800 font-medium">
                      Pour confirmer, tapez "SUPPRIMER" ci-dessous :
                    </p>
                    <input
                      type="text"
                      value={confirmDelete}
                      onChange={(e) => setConfirmDelete(e.target.value)}
                      placeholder="Tapez SUPPRIMER"
                      className="w-full p-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setShowDeleteConfirm(false);
                          setConfirmDelete('');
                        }}
                        className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={handleDeleteAllData}
                        disabled={isLoading || confirmDelete !== 'SUPPRIMER'}
                        className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                      >
                        {isLoading ? 'Suppression...' : 'Confirmer la suppression'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 px-6 py-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              🔒 Toutes les opérations sont effectuées localement
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataManagement;