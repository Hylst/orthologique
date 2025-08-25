import React, { useState, useEffect } from 'react';
import { X, User, Shuffle } from 'lucide-react';
import { UserProfile } from '../types';
import { 
  saveUserProfile, 
  setCurrentUser
} from '../utils/storage';

/**
 * Simple Authentication Modal
 * Allows users to connect with just avatar and name (no email required)
 * GDPR-compliant minimal data collection
 */

interface SimpleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (profile: UserProfile) => void;
}

const SimpleAuthModal: React.FC<SimpleAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    avatar: '👤'
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const avatarOptions = [
    '👤', '👨‍🎓', '👩‍🎓', '🧑‍💻', '👨‍💻', '👩‍💻', 
    '🧑‍🏫', '👨‍🏫', '👩‍🏫', '🧑‍🎨', '👨‍🎨', '👩‍🎨',
    '🦸‍♂️', '🦸‍♀️', '🧙‍♂️', '🧙‍♀️', '🧑‍🚀', '👨‍🚀', '👩‍🚀',
    '🐱', '🐶', '🦊', '🐼', '🦁', '🐸', '🐧', '🦄', '🐲'
  ];

  /**
   * Reset form when modal opens
   */
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        avatar: getRandomAvatar()
      });
      setError('');
    }
  }, [isOpen]);

  /**
   * Get a random avatar from the available options
   */
  const getRandomAvatar = (): string => {
    return avatarOptions[Math.floor(Math.random() * avatarOptions.length)];
  };

  /**
   * Generate a random avatar selection
   */
  const shuffleAvatar = () => {
    setFormData(prev => ({
      ...prev,
      avatar: getRandomAvatar()
    }));
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validate name
      if (!formData.name.trim()) {
        throw new Error('Le nom est requis');
      }

      if (formData.name.trim().length < 2) {
        throw new Error('Le nom doit contenir au moins 2 caractères');
      }

      if (formData.name.trim().length > 50) {
        throw new Error('Le nom ne peut pas dépasser 50 caractères');
      }

      // Create profile with minimal data (no email)
      const newProfile = createSimpleProfile(
        formData.name.trim(),
        formData.avatar
      );

      // Save profile
      saveUserProfile(newProfile);
      setCurrentUser(newProfile);
      onSuccess(newProfile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Create a simple user profile without email
   */
  const createSimpleProfile = (name: string, avatar: string): UserProfile => {
    const userId = 'simple_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    return {
      id: userId,
      name,
      email: '', // No email required for simple mode
      age: null,
      avatar,
      notes: '',
      preferences: {
        audioEnabled: true,
        speechRate: 0.8,
        fontSize: 'medium',
        theme: 'light',
        notifications: true,
      },
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            Connexion rapide
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Info banner */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="text-green-600 mt-0.5">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium text-green-800 mb-1">
                  Mode connexion simple
                </h3>
                <p className="text-sm text-green-700">
                  Commencez rapidement avec juste un nom et un avatar. 
                  Aucune donnée personnelle n'est requise.
                </p>
              </div>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Name input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              Votre nom *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Comment vous appelle-t-on ?"
              required
              maxLength={50}
              aria-describedby="name-help"
            />
            <p id="name-help" className="text-xs text-gray-500 mt-1">
              Ce nom sera affiché dans l'application
            </p>
          </div>

          {/* Avatar selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Choisissez votre avatar
              </label>
              <button
                type="button"
                onClick={shuffleAvatar}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                aria-label="Choisir un avatar aléatoire"
              >
                <Shuffle className="w-4 h-4" />
                Aléatoire
              </button>
            </div>
            
            <div className="grid grid-cols-6 gap-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-2">
              {avatarOptions.map((avatar) => (
                <button
                  key={avatar}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, avatar }))}
                  className={`text-2xl p-2 rounded-lg border-2 transition-all hover:scale-105 ${
                    formData.avatar === avatar
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  aria-label={`Sélectionner l'avatar ${avatar}`}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading || !formData.name.trim()}
            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isLoading ? 'Création...' : 'Commencer l\'apprentissage'}
          </button>

          {/* Privacy note */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              🔒 Vos données restent sur votre appareil. 
              Aucune information n'est envoyée sur internet.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SimpleAuthModal;