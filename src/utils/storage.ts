import { UserProgress, UserProfile, UserPreferences } from '../types';

const STORAGE_KEY = 'ortho-logique-progress';
const USERS_KEY = 'ortho-logique-users';
const CURRENT_USER_KEY = 'ortho-logique-current-user';
const USER_PROGRESS_PREFIX = 'ortho-logique-progress-';
const GDPR_CONSENT_KEY = 'ortho-logique-gdpr-consent';

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

// Alias for GDPR compliance
export const getAllUserProfiles = getAllUsers;

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

/**
 * Get user progress by user ID
 */
export const getUserProgress = (userId: string): UserProgress | null => {
  try {
    const stored = localStorage.getItem(USER_PROGRESS_PREFIX + userId);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Erreur lors du chargement de la progression:', error);
    return null;
  }
};

/**
 * Save user progress by user ID
 */
export const saveUserProgress = (userId: string, progress: UserProgress): void => {
  try {
    localStorage.setItem(USER_PROGRESS_PREFIX + userId, JSON.stringify(progress));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la progression:', error);
  }
};

/**
 * Clear all data (Right to be forgotten)
 */
export const clearAllData = (): void => {
  try {
    // Get all localStorage keys
    const keys = Object.keys(localStorage);
    
    // Remove all Orthologique-related data
    keys.forEach(key => {
      if (key.startsWith('ortho-logique-')) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Erreur lors de la suppression des données:', error);
    throw error;
  }
};

/**
 * Delete a specific user and their data
 */
export const deleteUser = (userId: string): void => {
  try {
    // Remove user from users list
    const users = getAllUsers().filter(u => u.id !== userId);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    // Remove user progress
    localStorage.removeItem(USER_PROGRESS_PREFIX + userId);
    
    // Clear current user if it's the deleted user
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      clearCurrentUser();
    }
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    throw error;
  }
};

/**
 * GDPR Consent Management
 */
export const saveGDPRConsent = (consent: {
  analytics: boolean;
  cookies: boolean;
  dataProcessing: boolean;
  timestamp: string;
}): void => {
  try {
    localStorage.setItem(GDPR_CONSENT_KEY, JSON.stringify(consent));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du consentement RGPD:', error);
  }
};

export const getGDPRConsent = (): {
  analytics: boolean;
  cookies: boolean;
  dataProcessing: boolean;
  timestamp: string;
} | null => {
  try {
    const stored = localStorage.getItem(GDPR_CONSENT_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Erreur lors du chargement du consentement RGPD:', error);
    return null;
  }
};

export const clearGDPRConsent = (): void => {
  try {
    localStorage.removeItem(GDPR_CONSENT_KEY);
  } catch (error) {
    console.error('Erreur lors de la suppression du consentement RGPD:', error);
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

/**
 * Enhanced Export/Import for GDPR compliance
 */
export const exportUserData = (userId?: string): string => {
  try {
    let users: UserProfile[];
    let progressData: Record<string, UserProgress> = {};
    
    if (userId) {
      // Export specific user
      const user = getAllUsers().find(u => u.id === userId);
      if (!user) throw new Error('Utilisateur non trouvé');
      users = [user];
      
      const progress = getUserProgress(userId);
      if (progress) {
        progressData[userId] = progress;
      }
    } else {
      // Export all users
      users = getAllUsers();
      
      // Get progress for each user
      users.forEach(user => {
        const progress = getUserProgress(user.id);
        if (progress) {
          progressData[user.id] = progress;
        }
      });
    }
    
    const exportData = {
      profiles: users,
      progress: progressData,
      gdprConsent: getGDPRConsent(),
      exportDate: new Date().toISOString(),
      version: '1.2.0'
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
    
    // Handle legacy format
    if (data.user && data.progress) {
      // Legacy single user format
      saveUserProfile(data.user);
      saveUserProgress(data.user.id, data.progress);
      setCurrentUser(data.user);
      return true;
    }
    
    // New format validation
    if (!data.profiles || !Array.isArray(data.profiles)) {
      throw new Error('Format de données invalide: profils manquants');
    }
    
    // Import profiles
    data.profiles.forEach((profile: UserProfile) => {
      // Validate profile structure
      if (!profile.id || !profile.name || !profile.createdAt) {
        throw new Error('Format de profil invalide');
      }
      
      saveUserProfile(profile);
      
      // Import progress if available
      if (data.progress && data.progress[profile.id]) {
        saveUserProgress(profile.id, data.progress[profile.id]);
      }
    });
    
    // Import GDPR consent if available
    if (data.gdprConsent) {
      saveGDPRConsent(data.gdprConsent);
    }
    
    // Set first profile as current user if no current user exists
    if (!getCurrentUser() && data.profiles.length > 0) {
      setCurrentUser(data.profiles[0]);
    }
    
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'import:', error);
    throw error;
  }
};

/**
 * Get storage usage statistics
 */
export const getStorageStats = (): {
  totalSize: number;
  profilesCount: number;
  progressCount: number;
  keys: string[];
} => {
  try {
    let totalSize = 0;
    const keys: string[] = [];
    
    // Calculate total size of Orthologique data
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('ortho-logique-')) {
        const value = localStorage.getItem(key);
        if (value) {
          totalSize += value.length;
          keys.push(key);
        }
      }
    });
    
    const profiles = getAllUsers();
    let progressCount = 0;
    
    profiles.forEach(profile => {
      if (getUserProgress(profile.id)) {
        progressCount++;
      }
    });
    
    return {
      totalSize,
      profilesCount: profiles.length,
      progressCount,
      keys
    };
  } catch (error) {
    console.error('Erreur lors du calcul des statistiques:', error);
    return {
      totalSize: 0,
      profilesCount: 0,
      progressCount: 0,
      keys: []
    };
  }
};