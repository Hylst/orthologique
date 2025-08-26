import React from 'react';
import { X, User, Mail, Calendar, FileText, Upload } from 'lucide-react';
import { UserProfile } from '../types';
import { 
  saveUserProfile, 
  getUserByEmail, 
  setCurrentUser, 
  createDefaultProfile,
  importUserData
} from '../utils/storage';

interface AuthModalProps {
  isOpen: boolean;
  mode: 'signin' | 'signup';
  onClose: () => void;
  onSuccess: (profile: UserProfile) => void;
  onModeChange: (mode: 'signin' | 'signup') => void;
}

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  mode,
  onClose,
  onSuccess,
  onModeChange,
}) => {
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    age: '',
    notes: '',
    avatar: '👤'
  });
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const avatarOptions = [
    '👤', '👨‍🎓', '👩‍🎓', '🧑‍💻', '👨‍💻', '👩‍💻', 
    '🧑‍🏫', '👨‍🏫', '👩‍🏫', '🧑‍🎨', '👨‍🎨', '👩‍🎨',
    '🦸‍♂️', '🦸‍♀️', '🧙‍♂️', '🧙‍♀️', '🧑‍🚀', '👨‍🚀', '👩‍🚀'
  ];

  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        email: '',
        age: '',
        notes: '',
        avatar: '👤'
      });
      setError('');
    }
  }, [isOpen, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (mode === 'signin') {
        // Connexion
        if (!formData.email) {
          throw new Error('L\'email est requis');
        }

        const existingUser = getUserByEmail(formData.email);
        if (!existingUser) {
          throw new Error('Aucun compte trouvé avec cet email');
        }

        // Mise à jour de la dernière connexion
        const updatedUser = {
          ...existingUser,
          lastLoginAt: new Date().toISOString()
        };
        
        saveUserProfile(updatedUser);
        setCurrentUser(updatedUser);
        onSuccess(updatedUser);
      } else {
        // Inscription
        if (!formData.name || !formData.email) {
          throw new Error('Le nom et l\'email sont requis');
        }

        // Vérifier si l'email existe déjà
        const existingUser = getUserByEmail(formData.email);
        if (existingUser) {
          throw new Error('Un compte existe déjà avec cet email');
        }

        // Créer le nouveau profil
        const newProfile = createDefaultProfile(
          formData.name,
          formData.email,
          formData.age ? parseInt(formData.age) : undefined
        );

        // Personnaliser avec les données du formulaire
        newProfile.avatar = formData.avatar;
        newProfile.notes = formData.notes;

        saveUserProfile(newProfile);
        setCurrentUser(newProfile);
        onSuccess(newProfile);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
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
          // Recharger la page pour appliquer les données importées
          window.location.reload();
        } else {
          setError('Impossible d\'importer les données. Vérifiez le format du fichier.');
        }
      } catch (err) {
        setError('Fichier invalide. Veuillez sélectionner un fichier JSON valide.');
      }
    };
    reader.readAsText(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            {mode === 'signin' ? 'Connexion' : 'Créer un compte'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  Nom *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Votre nom ou prénom"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Avatar
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {avatarOptions.map((avatar) => (
                    <button
                      key={avatar}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, avatar }))}
                      className={`text-2xl p-2 rounded-lg border-2 transition-colors ${
                        formData.avatar === avatar
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {avatar}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline mr-1" />
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="votre@email.com"
              required
            />
          </div>

          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Âge (optionnel)
                </label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Votre âge"
                  min="5"
                  max="120"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="w-4 h-4 inline mr-1" />
                  Notes personnelles (optionnel)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Objectifs, difficultés particulières..."
                  rows={3}
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isLoading ? 'Chargement...' : mode === 'signin' ? 'Se connecter' : 'Créer le compte'}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => onModeChange(mode === 'signin' ? 'signup' : 'signin')}
              className="text-blue-500 hover:text-blue-600 transition-colors text-sm"
            >
              {mode === 'signin' 
                ? 'Pas encore de compte ? Créer un compte' 
                : 'Déjà un compte ? Se connecter'
              }
            </button>
          </div>

          {mode === 'signin' && (
            <div className="border-t pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Upload className="w-4 h-4 inline mr-1" />
                Importer des données
              </label>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="text-xs text-gray-500 mt-1">
                Importez un fichier JSON exporté précédemment
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AuthModal;