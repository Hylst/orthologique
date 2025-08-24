export interface Exercise {
  id: string;
  type: 'qcm' | 'fill-in-the-blank' | 'drag-drop' | 'transformation' | 'dictation';
  sentence: string;
  instruction?: string; // Pour les exercices de transformation
  options?: string[];
  answer: string | string[];
  feedbackCorrect: string;
  feedbackIncorrect: string;
  hint?: string;
  audioText?: string; // Pour les exercices de dictée
}

export interface Lesson {
  id: string;
  title: string;
  level: number;
  difficulty: 'debutant' | 'intermediaire' | 'avance' | 'expert';
  targetAudience: string; // "CM1-CM2", "6e-5e", "4e-3e", "Lycée", "Adulte"
  category: 'orthographe' | 'conjugaison' | 'ponctuation' | 'syntaxe';
  rule: string;
  explanation: string;
  etymology?: string; // Contexte historique/étymologique
  specialCases?: SpecialCase[]; // Cas particuliers et exceptions
  mnemonics: string;
  examples: string[];
  literaryExamples?: LiteraryExample[]; // Exemples tirés de textes
  exercises: Exercise[];
  unlocked: boolean;
  completed: boolean;
  passingScore: number; // Score minimum requis pour débloquer la leçon suivante (par défaut 70%)
  prerequisites?: string[]; // IDs des leçons prérequises
}

export interface SpecialCase {
  title: string;
  description: string;
  examples: string[];
  tip?: string; // Astuce spécifique pour ce cas
}

export interface LiteraryExample {
  text: string;
  author: string;
  work: string;
  explanation: string; // Explication de la règle dans ce contexte
}
export interface UserProgress {
  userName: string;
  userProfile: UserProfile;
  completedLessons: string[];
  scores: Record<string, number>;
  lastPosition: string;
  totalScore: number;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  age: number | null;
  avatar: string; // URL ou nom de fichier
  notes: string;
  preferences: UserPreferences;
  createdAt: string;
  lastLoginAt: string;
}

export interface UserPreferences {
  audioEnabled: boolean;
  speechRate: number; // 0.5 à 2.0
  fontSize: 'small' | 'medium' | 'large';
  theme: 'light' | 'dark' | 'dyslexia';
  notifications: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  currentUser: UserProfile | null;
  showAuthModal: boolean;
  authMode: 'signin' | 'signup';
}

export interface AppState {
  currentView: 'dashboard' | 'lesson' | 'exercise' | 'results';
  currentLessonId: string | null;
  currentExerciseIndex: number;
  userProgress: UserProgress;
  lessons: Lesson[];
  isLoading: boolean;
  authState: AuthState;
}

export interface ProgressStats {
  totalLessons: number;
  completedCount: number;
  averageScore: number;
  progressPercentage: number;
  totalScore: number;
}