import React from 'react';
import { Play, RotateCcw, Trophy, Target, Volume2, Lock, CheckCircle, Database, BarChart3, LogIn, Settings, BookOpen } from 'lucide-react';
import { Lesson, UserProgress, UserProfile } from '../types';
import { ProgressManager } from '../utils/progressManager';
import Logo from './Logo';
import UserMenu from './UserMenu';
import AuthModal from './AuthModal';
import SimpleAuthModal from './SimpleAuthModal';
import ProfileModal from './ProfileModal';
import DataManagement from './DataManagement';
import AdvancedDashboard from './AdvancedDashboard';
import OneHandModeToggle from './OneHandModeToggle';
import MobileNavigation from './MobileNavigation';
import { useTouchGestures } from '../hooks/useTouchGestures';
import { MobileViewport, OneHandMode } from '../utils/mobileInteractions';
import ProgressBar from './ProgressBar';
import PWAInstallButton from './PWAInstallButton';
import OfflineIndicator from './OfflineIndicator';
import VisualProgress from './VisualProgress';
import { speak } from '../utils/audio';
import { getCurrentUser } from '../utils/storage';
import { 
  getButtonAriaAttributes, 
  getLessonCardAriaAttributes, 
  getAudioControlAriaAttributes,
  handleKeyboardActivation
} from '../utils/accessibility';

interface DashboardProps {
  lessons: Lesson[];
  userProgress: UserProgress;
  onStartLesson: (lessonId: string) => void;
  onResetProgress: () => void;
  onUpdateUserProfile: (profile: UserProfile) => void;
}

// Fonction utilitaire pour obtenir la couleur selon la difficulté (couleurs douces)
const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'debutant': return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    case 'intermediaire': return 'bg-amber-50 text-amber-700 border border-amber-200';
    case 'avance': return 'bg-orange-50 text-orange-700 border border-orange-200';
    case 'expert': return 'bg-rose-50 text-rose-700 border border-rose-200';
    default: return 'bg-slate-50 text-slate-700 border border-slate-200';
  }
};

// Fonction utilitaire pour obtenir la couleur selon la catégorie (couleurs douces)
const getCategoryColor = (category: string) => {
  switch (category) {
    case 'orthographe': return 'bg-sky-50 text-sky-700 border border-sky-200';
    case 'conjugaison': return 'bg-violet-50 text-violet-700 border border-violet-200';
    case 'ponctuation': return 'bg-indigo-50 text-indigo-700 border border-indigo-200';
    case 'syntaxe': return 'bg-pink-50 text-pink-700 border border-pink-200';
    default: return 'bg-slate-50 text-slate-700 border border-slate-200';
  }
};

// Fonction utilitaire pour obtenir la couleur de fond de la carte selon la difficulté
const getCardBackgroundColor = (difficulty: string, isCompleted: boolean, hasPassingScore: boolean) => {
  if (isCompleted && hasPassingScore) {
    switch (difficulty) {
      case 'debutant': return 'bg-gradient-to-br from-emerald-25 to-emerald-50';
      case 'intermediaire': return 'bg-gradient-to-br from-amber-25 to-amber-50';
      case 'avance': return 'bg-gradient-to-br from-orange-25 to-orange-50';
      case 'expert': return 'bg-gradient-to-br from-rose-25 to-rose-50';
      default: return 'bg-gradient-to-br from-slate-25 to-slate-50';
    }
  }
  return 'bg-white';
};

const Dashboard: React.FC<DashboardProps> = ({
  lessons,
  userProgress,
  onStartLesson,
  onResetProgress,
  onUpdateUserProfile,
}) => {
  const [isResetting, setIsResetting] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState<UserProfile | null>(getCurrentUser());
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const [showSimpleAuthModal, setShowSimpleAuthModal] = React.useState(false);
  const [authMode, setAuthMode] = React.useState<'signin' | 'signup'>('signin');
  const [showProfileModal, setShowProfileModal] = React.useState(false);
  const [showDataManagement, setShowDataManagement] = React.useState(false);
  const [showAdvancedDashboard, setShowAdvancedDashboard] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const [isOneHandMode, setIsOneHandMode] = React.useState(false);
  const [currentView, setCurrentView] = React.useState<'dashboard' | 'lesson' | 'exercise' | 'results' | 'profile' | 'settings'>('dashboard');
  
  // Mobile detection and one-hand mode
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(MobileViewport.isMobile());
      setIsOneHandMode(OneHandMode.isActive());
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    window.addEventListener('orientationchange', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('orientationchange', checkMobile);
    };
  }, []);
  
  // Touch gestures for mobile navigation
  const { onTouchStart, onTouchMove, onTouchEnd } = useTouchGestures({
    onSwipeLeft: () => {
      if (isMobile && currentView === 'dashboard') {
        setCurrentView('lesson');
      }
    },
    onSwipeRight: () => {
      if (isMobile && currentView === 'lesson') {
        setCurrentView('dashboard');
      }
    },
    onSwipeUp: () => {
      if (isMobile && !showAdvancedDashboard) {
        setShowAdvancedDashboard(true);
      }
    }
  });
  const [selectedDifficulty, setSelectedDifficulty] = React.useState<string>('all');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
  const [showSuccessTree, setShowSuccessTree] = React.useState(true);
  const [showProgressCompanion, setShowProgressCompanion] = React.useState(true);
  
  React.useEffect(() => {
    setCurrentUser(getCurrentUser());
  }, []);

  const progressManager = React.useMemo(() => {
    const pm = new ProgressManager();
    return pm;
  }, []);

  const stats = progressManager.getProgressStats(lessons);
  const nextLesson = progressManager.getNextLesson(lessons);
  
  // Check if user has completed at least one lesson
  const hasCompletedFirstLesson = userProgress.completedLessons.length > 0;

  // Mise à jour des leçons avec les statuts de déblocage corrects
  const processedLessons = lessons.map(lesson => ({
    ...lesson,
    unlocked: progressManager.canUnlockLesson(lesson.id, lessons),
    completed: progressManager.isLessonCompleted(lesson.id),
  }));

  // Filtrage des leçons selon la difficulté et la catégorie
  const filteredLessons = processedLessons.filter(lesson => {
    const difficultyMatch = selectedDifficulty === 'all' || lesson.difficulty === selectedDifficulty;
    const categoryMatch = selectedCategory === 'all' || lesson.category === selectedCategory;
    return difficultyMatch && categoryMatch;
  });

  // Statistiques par difficulté
  const difficultyStats = React.useMemo(() => {
    const stats = {
      debutant: { total: 0, completed: 0 },
      intermediaire: { total: 0, completed: 0 },
      avance: { total: 0, completed: 0 },
      expert: { total: 0, completed: 0 }
    };
    
    processedLessons.forEach(lesson => {
      stats[lesson.difficulty].total++;
      if (lesson.completed) {
        stats[lesson.difficulty].completed++;
      }
    });
    
    return stats;
  }, [processedLessons]);

  const handleReset = () => {
    if (isResetting) {
      onResetProgress();
      setIsResetting(false);
    } else {
      setIsResetting(true);
      setTimeout(() => setIsResetting(false), 5000);
    }
  };

  const handleAuthSuccess = (profile: UserProfile) => {
    setCurrentUser(profile);
    onUpdateUserProfile(profile);
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    // Créer un profil invité temporaire
    const guestProfile: UserProfile = {
      id: 'guest',
      name: 'Invité',
      email: '',
      age: null,
      avatar: '👤',
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
    onUpdateUserProfile(guestProfile);
  };

  const handleProfileUpdate = (profile: UserProfile) => {
    setCurrentUser(profile);
    onUpdateUserProfile(profile);
  };

  const handleSpeak = async (text: string) => {
    try {
      await speak(text);
    } catch (error) {
      console.error('Speech synthesis failed:', error);
      // Optionally show a user-friendly message
    }
  };

  const handleStartLesson = (lessonId: string) => {
    const lesson = processedLessons.find(l => l.id === lessonId);
    if (lesson && lesson.unlocked) {
      onStartLesson(lessonId);
    }
  };

  return (
    <div 
      className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 ${
        isOneHandMode ? 'one-hand-mode' : ''
      } ${isMobile ? 'safe-area-top safe-area-bottom' : ''}`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="flex items-center justify-between mb-6">
            <Logo size="large" />
            
            {/* User Menu or Login Button */}
            <div className="flex items-center gap-4">
              <PWAInstallButton />
              
              {/* Data Management Button */}
              <button
                onClick={() => setShowDataManagement(true)}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                {...getButtonAriaAttributes('Ouvrir la gestion des données')}
                title="Gestion des données (RGPD)"
              >
                <Database className="w-4 h-4" />
              </button>
              
              {/* Advanced Dashboard Button */}
              <button
                onClick={() => setShowAdvancedDashboard(true)}
                className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-md hover:shadow-lg"
                {...getButtonAriaAttributes('Ouvrir les tableaux de bord avancés')}
                title="Tableaux de Bord Avancés - Analytics et Métriques"
              >
                <BarChart3 className="w-4 h-4" />
              </button>
              
              {/* One Hand Mode Toggle - Mobile Only */}
              {isMobile && (
                <OneHandModeToggle />
              )}
              
              {currentUser && currentUser.id !== 'guest' ? (
                <UserMenu 
                  user={currentUser}
                  onLogout={handleLogout}
                  onEditProfile={() => setShowProfileModal(true)}
                />
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowSimpleAuthModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    {...getButtonAriaAttributes('Connexion simple avec avatar et nom')}
                  >
                    <LogIn className="w-4 h-4" />
                    Connexion simple
                  </button>
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    {...getButtonAriaAttributes('Ouvrir la modal de connexion complète')}
                  >
                    <Settings className="w-4 h-4" />
                    Connexion complète
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-2 mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">
              {currentUser ? `Bonjour, ${currentUser.name} !` : 'Bienvenue dans OrthoLogique !'}
            </h2>
            <button
              onClick={() => handleSpeak(currentUser ? `Bonjour, ${currentUser.name} !` : 'Bienvenue dans OrthoLogique !')}
              className="p-1 text-gray-500 hover:text-blue-500 transition-colors"
              {...getAudioControlAriaAttributes(currentUser ? `Bonjour, ${currentUser.name} !` : 'Bienvenue dans OrthoLogique !')}
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>

          {/* Prochaine leçon recommandée */}
          {nextLesson && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 mb-2">
                <strong>Prochaine leçon recommandée :</strong>
              </p>
              <button
                onClick={() => handleStartLesson(nextLesson.id)}
                className="flex items-center gap-2 mx-auto px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                {...getButtonAriaAttributes(`Commencer la leçon recommandée: ${nextLesson.title}`)}
              >
                <Play className="w-4 h-4" />
                {nextLesson.title}
              </button>
            </div>
          )}
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8" role="region" aria-label="Statistiques de progression">
          <div className="bg-white rounded-xl shadow-lg p-6" role="article" aria-labelledby="lessons-completed-title">
            <div className="flex items-center gap-3 mb-3">
              <BookOpen className="w-6 h-6 text-blue-500" aria-hidden="true" />
              <h3 id="lessons-completed-title" className="font-semibold text-gray-800">Leçons terminées</h3>
            </div>
            <p className="text-3xl font-bold text-blue-600" aria-label={`${stats.completedCount} leçons terminées sur ${stats.totalLessons} au total`}>
              {stats.completedCount}/{stats.totalLessons}
            </p>
            <p className="text-sm text-gray-600 mt-1">{stats.progressPercentage}% du parcours</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6" role="article" aria-labelledby="average-score-title">
            <div className="flex items-center gap-3 mb-3">
              <Target className="w-6 h-6 text-green-500" aria-hidden="true" />
              <h3 id="average-score-title" className="font-semibold text-gray-800">Score moyen</h3>
            </div>
            <p className="text-3xl font-bold text-green-600" aria-label={`Score moyen de ${stats.averageScore} pourcent`}>
              {stats.averageScore}%
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {stats.averageScore >= 80 ? 'Excellent !' : stats.averageScore >= 70 ? 'Très bien !' : 'Continue !'}
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6" role="article" aria-labelledby="trophies-title">
            <div className="flex items-center gap-3 mb-3">
              <Trophy className="w-6 h-6 text-yellow-500" aria-hidden="true" />
              <h3 id="trophies-title" className="font-semibold text-gray-800">Trophées</h3>
            </div>
            <p className="text-3xl font-bold text-yellow-600" aria-label={`${stats.completedCount} trophées obtenus`}>
              {stats.completedCount}
            </p>
            <p className="text-sm text-gray-600 mt-1">Leçons maîtrisées</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6" role="article" aria-labelledby="current-level-title">
            <div className="flex items-center gap-3 mb-3">
              <Target className="w-6 h-6 text-purple-500" aria-hidden="true" />
              <h3 id="current-level-title" className="font-semibold text-gray-800">Niveau actuel</h3>
            </div>
            <p className="text-2xl font-bold text-purple-600" aria-label={`Niveau actuel: ${stats.averageScore >= 90 ? 'Expert' : stats.averageScore >= 75 ? 'Avancé' : stats.averageScore >= 60 ? 'Intermédiaire' : 'Débutant'}`}>
              {stats.averageScore >= 90 ? 'Expert' : 
               stats.averageScore >= 75 ? 'Avancé' : 
               stats.averageScore >= 60 ? 'Intermédiaire' : 'Débutant'}
            </p>
            <p className="text-sm text-gray-600 mt-1">Basé sur vos performances</p>
          </div>
        </div>

        {/* Statistiques par difficulté */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8" role="region" aria-labelledby="difficulty-progress-title">
          <h3 id="difficulty-progress-title" className="font-semibold text-gray-800 mb-4">Progression par niveau</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(difficultyStats).map(([difficulty, stats]) => {
              const progressPercentage = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
              return (
                <div key={difficulty} className="text-center" role="article" aria-labelledby={`difficulty-${difficulty}-title`}>
                  <div 
                    id={`difficulty-${difficulty}-title`}
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-2 ${getDifficultyColor(difficulty)}`}
                  >
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </div>
                  <p 
                    className="text-lg font-bold text-gray-800" 
                    aria-label={`${stats.completed} leçons terminées sur ${stats.total} au niveau ${difficulty}`}
                  >
                    {stats.completed}/{stats.total}
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1" role="progressbar" aria-valuenow={progressPercentage} aria-valuemin={0} aria-valuemax={100} aria-label={`Progression niveau ${difficulty}: ${Math.round(progressPercentage)}%`}>
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="font-semibold text-gray-800 mb-4">Progression générale</h3>
          <ProgressBar current={stats.completedCount} total={stats.totalLessons} />
        </div>

        {/* Visual Progress Elements - Only show after completing first lesson */}
        {hasCompletedFirstLesson && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Success Tree */}
            {showSuccessTree && (
              <div className="bg-white rounded-xl shadow-lg p-6 relative">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-800 text-center flex-1">Arbre de la réussite</h3>
                  <button
                    onClick={() => setShowSuccessTree(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded"
                    title="Masquer l'arbre de la réussite"
                    aria-label="Masquer l'arbre de la réussite"
                  >
                    ✕
                  </button>
                </div>
                <div className="aspect-square max-w-sm mx-auto">
                  <VisualProgress userProgress={userProgress} type="tree" />
                </div>
              </div>
            )}
            
            {/* Progress Companion */}
            {showProgressCompanion && (
              <div className="bg-white rounded-xl shadow-lg p-6 relative">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-800 text-center flex-1">Compagnon de progression</h3>
                  <button
                    onClick={() => setShowProgressCompanion(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded"
                    title="Masquer le compagnon de progression"
                    aria-label="Masquer le compagnon de progression"
                  >
                    ✕
                  </button>
                </div>
                <div className="aspect-square max-w-sm mx-auto">
                  <VisualProgress userProgress={userProgress} type="cat" />
                </div>
              </div>
            )}
            
            {/* Show buttons to restore hidden components */}
            {(!showSuccessTree || !showProgressCompanion) && (
              <div className="col-span-full flex justify-center gap-4">
                {!showSuccessTree && (
                  <button
                    onClick={() => setShowSuccessTree(true)}
                    className="bg-green-100 text-green-800 px-4 py-2 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    🌳 Afficher l'arbre de la réussite
                  </button>
                )}
                {!showProgressCompanion && (
                  <button
                    onClick={() => setShowProgressCompanion(true)}
                    className="bg-orange-100 text-orange-800 px-4 py-2 rounded-lg hover:bg-orange-200 transition-colors"
                  >
                    🐱 Afficher le compagnon de progression
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Filtres */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-[8px_8px_16px_rgba(0,0,0,0.1),-8px_-8px_16px_rgba(255,255,255,0.9)] p-8 mb-8 border border-gray-100/50">
          <h3 className="font-semibold text-gray-800 mb-6 text-lg">Filtrer les leçons</h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Niveau de difficulté
              </label>
              <div className="flex flex-wrap gap-3" role="group" aria-describedby="difficulty-help">
                <button
                  onClick={() => setSelectedDifficulty('all')}
                  className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                    selectedDifficulty === 'all'
                      ? 'bg-gray-600 text-white shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2)] scale-95'
                      : 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-700 shadow-[4px_4px_8px_rgba(0,0,0,0.1),-2px_-2px_4px_rgba(255,255,255,0.9)] hover:shadow-[6px_6px_12px_rgba(0,0,0,0.15),-3px_-3px_6px_rgba(255,255,255,0.9)]'
                  }`}
                  aria-pressed={selectedDifficulty === 'all'}
                >
                  Tous les niveaux
                </button>
                <button
                  onClick={() => setSelectedDifficulty('debutant')}
                  className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                    selectedDifficulty === 'debutant'
                      ? 'bg-emerald-500 text-white shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2)] scale-95'
                      : 'bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-700 border border-emerald-200 shadow-[4px_4px_8px_rgba(0,0,0,0.1),-2px_-2px_4px_rgba(255,255,255,0.9)] hover:shadow-[6px_6px_12px_rgba(0,0,0,0.15),-3px_-3px_6px_rgba(255,255,255,0.9)]'
                  }`}
                  aria-pressed={selectedDifficulty === 'debutant'}
                >
                  🌱 Débutant (CM1-CM2)
                </button>
                <button
                  onClick={() => setSelectedDifficulty('intermediaire')}
                  className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                    selectedDifficulty === 'intermediaire'
                      ? 'bg-amber-500 text-white shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2)] scale-95'
                      : 'bg-gradient-to-br from-amber-50 to-amber-100 text-amber-700 border border-amber-200 shadow-[4px_4px_8px_rgba(0,0,0,0.1),-2px_-2px_4px_rgba(255,255,255,0.9)] hover:shadow-[6px_6px_12px_rgba(0,0,0,0.15),-3px_-3px_6px_rgba(255,255,255,0.9)]'
                  }`}
                  aria-pressed={selectedDifficulty === 'intermediaire'}
                >
                  ⚡ Intermédiaire (6e-5e)
                </button>
                <button
                  onClick={() => setSelectedDifficulty('avance')}
                  className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                    selectedDifficulty === 'avance'
                      ? 'bg-orange-500 text-white shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2)] scale-95'
                      : 'bg-gradient-to-br from-orange-50 to-orange-100 text-orange-700 border border-orange-200 shadow-[4px_4px_8px_rgba(0,0,0,0.1),-2px_-2px_4px_rgba(255,255,255,0.9)] hover:shadow-[6px_6px_12px_rgba(0,0,0,0.15),-3px_-3px_6px_rgba(255,255,255,0.9)]'
                  }`}
                  aria-pressed={selectedDifficulty === 'avance'}
                >
                  🔥 Avancé (4e-3e)
                </button>
                <button
                  onClick={() => setSelectedDifficulty('expert')}
                  className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                    selectedDifficulty === 'expert'
                      ? 'bg-rose-500 text-white shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2)] scale-95'
                      : 'bg-gradient-to-br from-rose-50 to-rose-100 text-rose-700 border border-rose-200 shadow-[4px_4px_8px_rgba(0,0,0,0.1),-2px_-2px_4px_rgba(255,255,255,0.9)] hover:shadow-[6px_6px_12px_rgba(0,0,0,0.15),-3px_-3px_6px_rgba(255,255,255,0.9)]'
                  }`}
                  aria-pressed={selectedDifficulty === 'expert'}
                >
                  💎 Expert (Lycée)
                </button>
              </div>
              <div id="difficulty-help" className="sr-only">
                Filtrer les leçons par niveau de difficulté en utilisant les boutons colorés
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Catégorie
              </label>
              <div className="flex flex-wrap gap-3" role="group" aria-describedby="category-help">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                    selectedCategory === 'all'
                      ? 'bg-gray-600 text-white shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2)] scale-95'
                      : 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-700 shadow-[4px_4px_8px_rgba(0,0,0,0.1),-2px_-2px_4px_rgba(255,255,255,0.9)] hover:shadow-[6px_6px_12px_rgba(0,0,0,0.15),-3px_-3px_6px_rgba(255,255,255,0.9)]'
                  }`}
                  aria-pressed={selectedCategory === 'all'}
                >
                  Toutes
                </button>
                <button
                  onClick={() => setSelectedCategory('orthographe')}
                  className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                    selectedCategory === 'orthographe'
                      ? 'bg-sky-500 text-white shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2)] scale-95'
                      : 'bg-gradient-to-br from-sky-50 to-sky-100 text-sky-700 border border-sky-200 shadow-[4px_4px_8px_rgba(0,0,0,0.1),-2px_-2px_4px_rgba(255,255,255,0.9)] hover:shadow-[6px_6px_12px_rgba(0,0,0,0.15),-3px_-3px_6px_rgba(255,255,255,0.9)]'
                  }`}
                  aria-pressed={selectedCategory === 'orthographe'}
                >
                  📝 Orthographe
                </button>
                <button
                  onClick={() => setSelectedCategory('conjugaison')}
                  className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                    selectedCategory === 'conjugaison'
                      ? 'bg-violet-500 text-white shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2)] scale-95'
                      : 'bg-gradient-to-br from-violet-50 to-violet-100 text-violet-700 border border-violet-200 shadow-[4px_4px_8px_rgba(0,0,0,0.1),-2px_-2px_4px_rgba(255,255,255,0.9)] hover:shadow-[6px_6px_12px_rgba(0,0,0,0.15),-3px_-3px_6px_rgba(255,255,255,0.9)]'
                  }`}
                  aria-pressed={selectedCategory === 'conjugaison'}
                >
                  🔄 Conjugaison
                </button>
                <button
                  onClick={() => setSelectedCategory('ponctuation')}
                  className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                    selectedCategory === 'ponctuation'
                      ? 'bg-indigo-500 text-white shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2)] scale-95'
                      : 'bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-700 border border-indigo-200 shadow-[4px_4px_8px_rgba(0,0,0,0.1),-2px_-2px_4px_rgba(255,255,255,0.9)] hover:shadow-[6px_6px_12px_rgba(0,0,0,0.15),-3px_-3px_6px_rgba(255,255,255,0.9)]'
                  }`}
                  aria-pressed={selectedCategory === 'ponctuation'}
                >
                  ❓ Ponctuation
                </button>
                <button
                  onClick={() => setSelectedCategory('syntaxe')}
                  className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                    selectedCategory === 'syntaxe'
                      ? 'bg-pink-500 text-white shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2)] scale-95'
                      : 'bg-gradient-to-br from-pink-50 to-pink-100 text-pink-700 border border-pink-200 shadow-[4px_4px_8px_rgba(0,0,0,0.1),-2px_-2px_4px_rgba(255,255,255,0.9)] hover:shadow-[6px_6px_12px_rgba(0,0,0,0.15),-3px_-3px_6px_rgba(255,255,255,0.9)]'
                  }`}
                  aria-pressed={selectedCategory === 'syntaxe'}
                >
                  🏗️ Syntaxe
                </button>
              </div>
              <div id="category-help" className="sr-only">
                Filtrer les leçons par catégorie de contenu en utilisant les boutons colorés
              </div>
            </div>

          </div>
        </div>

        {/* Lessons */}
        <div className="space-y-4 mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800">
              Parcours d'apprentissage 
              {(selectedDifficulty !== 'all' || selectedCategory !== 'all') && (
                <span className="text-sm font-normal text-gray-600 ml-2">
                  ({filteredLessons.length} leçon{filteredLessons.length > 1 ? 's' : ''} trouvée{filteredLessons.length > 1 ? 's' : ''})
                </span>
              )}
            </h3>
            {(selectedDifficulty !== 'all' || selectedCategory !== 'all') && (
              <button
                onClick={() => {
                  setSelectedDifficulty('all');
                  setSelectedCategory('all');
                }}
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                {...getButtonAriaAttributes(
                  'Réinitialiser tous les filtres - Supprime tous les filtres appliqués et affiche toutes les leçons'
                )}
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
          {filteredLessons.map((lesson) => {
            const isCompleted = lesson.completed;
            const isUnlocked = lesson.unlocked;
            const score = userProgress.scores[lesson.id];
            const hasPassingScore = Boolean(score && score >= (lesson.passingScore || 70));

            return (
              <div
                key={lesson.id}
                className={`${getCardBackgroundColor(lesson.difficulty, isCompleted, hasPassingScore)} rounded-xl shadow-lg overflow-hidden transition-all duration-300 lesson-card ${
                  isUnlocked ? 'hover:shadow-xl hover:scale-[1.02]' : 'opacity-50'
                } border border-gray-100`}
                {...getLessonCardAriaAttributes(
                  lesson.title,
                  isCompleted && hasPassingScore,
                  !isUnlocked,
                  lesson.difficulty
                )}
                onKeyDown={(e) => handleKeyboardActivation(e, () => isUnlocked && handleStartLesson(lesson.id))}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-md ${
                        isCompleted && hasPassingScore ? 'bg-gradient-to-br from-emerald-400 to-emerald-500' : 
                        isCompleted ? 'bg-gradient-to-br from-amber-400 to-amber-500' : 
                        isUnlocked ? 'bg-gradient-to-br from-sky-400 to-sky-500' : 'bg-gradient-to-br from-slate-300 to-slate-400'
                      }`}>
                        {isCompleted && hasPassingScore ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : isCompleted ? (
                          <Target className="w-6 h-6" />
                        ) : !isUnlocked ? (
                          <Lock className="w-6 h-6" />
                        ) : (
                          lesson.level
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-800">{lesson.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(lesson.difficulty)}`}>
                            {lesson.difficulty}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(lesson.category)}`}>
                            {lesson.category}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{lesson.rule}</p>
                        <p className="text-xs text-gray-500">{lesson.targetAudience}</p>
                        {isCompleted && score && (
                          <div className="flex items-center gap-2 mt-1">
                            <p className={`text-sm font-medium ${
                              hasPassingScore ? 'text-emerald-600' : 'text-amber-600'
                            }`}>
                              Score: {score}% {hasPassingScore ? '✓' : `(min. ${lesson.passingScore || 70}%)`}
                            </p>
                            {hasPassingScore && (
                              <Trophy className="w-4 h-4 text-yellow-500" />
                            )}
                          </div>
                        )}
                        {!isUnlocked && (
                          <p className="text-sm text-gray-500">
                            🔒 Terminez la leçon précédente pour débloquer
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSpeak(lesson.rule)}
                        className="p-2 text-gray-500 hover:text-blue-500 transition-colors"
                        {...getAudioControlAriaAttributes(lesson.rule)}
                      >
                        <Volume2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleStartLesson(lesson.id)}
                        disabled={!isUnlocked}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                          isUnlocked
                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                        {...getButtonAriaAttributes(
                          `${isCompleted && hasPassingScore ? 'Réviser' : 
                           isCompleted ? 'Améliorer' : 'Commencer'} la leçon ${lesson.title}`,
                          undefined,
                          !isUnlocked
                        )}
                      >
                        <Play className="w-4 h-4" />
                        {isCompleted && hasPassingScore ? 'Réviser' : 
                         isCompleted ? 'Améliorer' : 'Commencer'}
                        {lesson.exercises?.some(ex => ['drag-drop', 'transformation', 'dictation'].includes(ex.type)) && (
                          <span className="ml-1 text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">
                            Nouveau !
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex justify-center">
          <button
            onClick={handleReset}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              isResetting
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <RotateCcw className="w-5 h-5" />
            {isResetting ? 'Confirmer la réinitialisation' : 'Réinitialiser ma progression'}
          </button>
        </div>
      </div>

      {/* Modals */}
      <AuthModal
        isOpen={showAuthModal}
        mode={authMode}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        onModeChange={setAuthMode}
      />

      <SimpleAuthModal
        isOpen={showSimpleAuthModal}
        onClose={() => setShowSimpleAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />

      <DataManagement
        isOpen={showDataManagement}
        onClose={() => setShowDataManagement(false)}
      />

      <AdvancedDashboard
        isOpen={showAdvancedDashboard}
        onClose={() => setShowAdvancedDashboard(false)}
      />

      {currentUser && currentUser.id !== 'guest' && (
        <ProfileModal
          isOpen={showProfileModal}
          user={currentUser}
          onClose={() => setShowProfileModal(false)}
          onUpdateProfile={handleProfileUpdate}
        />
      )}

      <OfflineIndicator />
      
      {/* Mobile Navigation - Only show on mobile */}
      {isMobile && (
        <MobileNavigation
          currentView={currentView}
          onNavigate={(view: string) => {
            const validViews = ['dashboard', 'lesson', 'exercise', 'results', 'profile', 'settings'] as const;
            if (validViews.includes(view as any)) {
              setCurrentView(view as typeof currentView);
            }
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;