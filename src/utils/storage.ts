import { UserProgress, UserProfile, UserPreferences } from '../types';

const STORAGE_KEY = 'ortho-logique-progress';
const USERS_KEY = 'ortho-logique-users';
const CURRENT_USER_KEY = 'ortho-logique-current-user';

export const saveProgress = (progress: UserProgress): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
  }
};

export const loadProgress = (): UserProgress | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Erreur lors du chargement:', error);
    return null;
  }
};

export const resetProgress = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Erreur lors de la réinitialisation:', error);
  }
};

// Gestion des profils utilisateur
export const saveUserProfile = (profile: UserProfile): void => {
  try {
    const users = getAllUsers();
    const existingIndex = users.findIndex(u => u.id === profile.id);
    
    if (existingIndex >= 0) {
      users[existingIndex] = profile;
    } else {
      users.push(profile);
    }
    
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du profil:', error);
  }
};

export const getAllUsers = (): UserProfile[] => {
  try {
    const stored = localStorage.getItem(USERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Erreur lors du chargement des utilisateurs:', error);
    return [];
  }
};

export const getUserByEmail = (email: string): UserProfile | null => {
  const users = getAllUsers();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
};

export const setCurrentUser = (profile: UserProfile): void => {
  try {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(profile));
  } catch (error) {
    console.error('Erreur lors de la définition de l\'utilisateur actuel:', error);
  }
};

export const getCurrentUser = (): UserProfile | null => {
  try {
    const stored = localStorage.getItem(CURRENT_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Erreur lors du chargement de l\'utilisateur actuel:', error);
    return null;
  }
};

export const clearCurrentUser = (): void => {
  try {
    localStorage.removeItem(CURRENT_USER_KEY);
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
  }
};

export const createDefaultProfile = (name: string, email: string, age?: number): UserProfile => ({
  id: generateUserId(),
  name,
  email,
  age: age || null,
  avatar: getRandomAvatar(),
  notes: '',
  preferences: createDefaultPreferences(),
  createdAt: new Date().toISOString(),
  lastLoginAt: new Date().toISOString(),
});

export const createDefaultPreferences = (): UserPreferences => ({
  audioEnabled: true,
  speechRate: 0.8,
  fontSize: 'medium',
  theme: 'light',
  notifications: true,
});

export const createDefaultProgress = (userProfile: UserProfile): UserProgress => ({
  userName: userProfile.name,
  userProfile,
  completedLessons: [],
  scores: {},
  lastPosition: 'sv-accord-1',
  totalScore: 0,
  createdAt: new Date().toISOString(),
});

// Utilitaires
const generateUserId = (): string => {
  return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

const getRandomAvatar = (): string => {
  const avatars = [
    '👤', '👨‍🎓', '👩‍🎓', '🧑‍💻', '👨‍💻', '👩‍💻', 
    '🧑‍🏫', '👨‍🏫', '👩‍🏫', '🧑‍🎨', '👨‍🎨', '👩‍🎨',
    '🦸‍♂️', '🦸‍♀️', '🧙‍♂️', '🧙‍♀️', '🧑‍🚀', '👨‍🚀', '👩‍🚀'
  ];
  return avatars[Math.floor(Math.random() * avatars.length)];
};

// Export/Import des données
export const exportUserData = (userId: string): string => {
  try {
    const users = getAllUsers();
    const user = users.find(u => u.id === userId);
    const progress = loadProgress();
    
    const exportData = {
      user,
      progress,
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };
    
    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    console.error('Erreur lors de l\'export:', error);
    throw new Error('Impossible d\'exporter les données');
  }
};

export const importUserData = (jsonData: string): boolean => {
  try {
    const data = JSON.parse(jsonData);
    
    // Validation basique
    if (!data.user || !data.progress) {
      throw new Error('Format de données invalide');
    }
    
    // Sauvegarde du profil
    saveUserProfile(data.user);
    
    // Sauvegarde de la progression
    saveProgress(data.progress);
    
    // Définir comme utilisateur actuel
    setCurrentUser(data.user);
    
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'import:', error);
    return false;
  }
};