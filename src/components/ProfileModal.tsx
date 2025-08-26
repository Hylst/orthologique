import React, { useState, useEffect } from 'react';
import { X, User, FileText, Download, Upload, Palette, Volume2, VolumeX, Type } from 'lucide-react';
import { UserProfile } from '../types';
import { exportUserData, importUserData } from '../utils/storage';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateProfile: (updatedUser: UserProfile) => void;
}

const AVATAR_OPTIONS = [
  '👤', '👨‍🎓', '👩‍🎓', '🧑‍💻', '👨‍💻', '👩‍💻', 
  '🧑‍🏫', '👨‍🏫', '👩‍🏫', '🧑‍🎨', '👨‍🎨', '👩‍🎨',
  '🦸‍♂️', '🦸‍♀️', '🧙‍♂️', '🧙‍♀️', '🧑‍🚀', '👨‍🚀', '👩‍🚀'
];

const THEME_OPTIONS = [
  { value: 'light', label: 'Clair', icon: '☀️' },
  { value: 'dark', label: 'Sombre', icon: '🌙' },
  { value: 'auto', label: 'Automatique', icon: '🔄' }
];

const FONT_SIZE_OPTIONS = [
  { value: 'small', label: 'Petit', size: '14px' },
  { value: 'medium', label: 'Moyen', size: '16px' },
  { value: 'large', label: 'Grand', size: '18px' },
  { value: 'xl', label: 'Très grand', size: '20px' }
];

export default function ProfileModal({ isOpen, onClose, user, onUpdateProfile }: ProfileModalProps) {
  const [formData, setFormData] = useState<UserProfile>(user);
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'data'>('profile');
  const [importError, setImportError] = useState<string>('');
  const [importSuccess, setImportSuccess] = useState<boolean>(false);

  useEffect(() => {
    setFormData(user);
  }, [user]);

  useEffect(() => {
    if (importError || importSuccess) {
      const timer = setTimeout(() => {
        setImportError('');
        setImportSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [importError, importSuccess]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formData);
    onClose();
  };

  const handleInputChange = (field: keyof UserProfile, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleExport = () => {
    try {
      const data = exportUserData(user.id);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ortho-logique-${user.name}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonData = event.target?.result as string;
        const success = importUserData(jsonData);
        
        if (success) {
          setImportSuccess(true);
          setImportError('');
          // Recharger la page pour appliquer les nouvelles données
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else {
          setImportError('Format de fichier invalide');
          setImportSuccess(false);
        }
      } catch (error) {
        setImportError('Erreur lors de la lecture du fichier');
        setImportSuccess(false);
      }
    };
    reader.readAsText(file);
    
    // Reset input
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Mon Profil</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'profile'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <User className="w-4 h-4 inline mr-2" />
            Profil
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'preferences'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Palette className="w-4 h-4 inline mr-2" />
            Préférences
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'data'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Données
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[60vh]">
          <div className="p-6">
            {/* Onglet Profil */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                {/* Avatar */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Avatar
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {AVATAR_OPTIONS.map((avatar) => (
                      <button
                        key={avatar}
                        type="button"
                        onClick={() => handleInputChange('avatar', avatar)}
                        className={`p-3 text-2xl rounded-lg border-2 transition-all hover:scale-110 ${
                          formData.avatar === avatar
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {avatar}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Nom */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Âge */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Âge
                  </label>
                  <input
                    type="number"
                    min="6"
                    max="120"
                    value={formData.age || ''}
                    onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes personnelles
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Objectifs, difficultés particulières, remarques..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>
            )}

            {/* Onglet Préférences */}
            {activeTab === 'preferences' && (
              <div className="space-y-6">
                {/* Audio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Audio
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.preferences.audioEnabled}
                        onChange={(e) => handleInputChange('preferences', {
                          ...formData.preferences,
                          audioEnabled: e.target.checked
                        })}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {formData.preferences.audioEnabled ? <Volume2 className="w-4 h-4 inline mr-1" /> : <VolumeX className="w-4 h-4 inline mr-1" />}
                        Activer les sons
                      </span>
                    </label>
                    
                    {formData.preferences.audioEnabled && (
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">
                          Vitesse de lecture : {formData.preferences.speechRate}x
                        </label>
                        <input
                          type="range"
                          min="0.5"
                          max="2"
                          step="0.1"
                          value={formData.preferences.speechRate}
                          onChange={(e) => handleInputChange('preferences', {
                            ...formData.preferences,
                            speechRate: parseFloat(e.target.value)
                          })}
                          className="w-full"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Taille de police */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <Type className="w-4 h-4 inline mr-1" />
                    Taille de police
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {FONT_SIZE_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleInputChange('preferences', {
                          ...formData.preferences,
                          fontSize: option.value
                        })}
                        className={`p-3 text-left rounded-lg border-2 transition-all ${
                          formData.preferences.fontSize === option.value
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        style={{ fontSize: option.size }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Thème */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Thème
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {THEME_OPTIONS.map((theme) => (
                      <button
                        key={theme.value}
                        type="button"
                        onClick={() => handleInputChange('preferences', {
                          ...formData.preferences,
                          theme: theme.value
                        })}
                        className={`p-3 text-center rounded-lg border-2 transition-all ${
                          formData.preferences.theme === theme.value
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-xl mb-1">{theme.icon}</div>
                        <div className="text-sm">{theme.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Onglet Données */}
            {activeTab === 'data' && (
              <div className="space-y-6">
                {/* Export */}
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">
                    <Download className="w-5 h-5 inline mr-2" />
                    Exporter mes données
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Téléchargez un fichier contenant votre profil et votre progression.
                  </p>
                  <button
                    type="button"
                    onClick={handleExport}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Download className="w-4 h-4 inline mr-2" />
                    Télécharger mes données
                  </button>
                </div>

                {/* Import */}
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">
                    <Upload className="w-5 h-5 inline mr-2" />
                    Importer des données
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Restaurez votre profil et progression depuis un fichier exporté.
                  </p>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                  
                  {importError && (
                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{importError}</p>
                    </div>
                  )}
                  
                  {importSuccess && (
                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-600">
                        Données importées avec succès ! La page va se recharger...
                      </p>
                    </div>
                  )}
                </div>

                {/* Informations du compte */}
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-gray-800 mb-3">
                    Informations du compte
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>ID :</strong> {user.id}</p>
                    <p><strong>Créé le :</strong> {new Date(user.createdAt).toLocaleDateString('fr-FR')}</p>
                    <p><strong>Dernière connexion :</strong> {new Date(user.lastLoginAt).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Sauvegarder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}