import React from 'react';
import { Play, RotateCcw, Trophy, BookOpen, Target, Volume2, Lock, CheckCircle, LogIn } from 'lucide-react';
import { Lesson, UserProgress, UserProfile } from '../types';
import { ProgressManager } from '../utils/progressManager';
import Logo from './Logo';
import UserMenu from './UserMenu';
import AuthModal from './AuthModal';
import ProfileModal from './ProfileModal';
import ProgressBar from './ProgressBar';
import PWAInstallButton from './PWAInstallButton';
import OfflineIndicator from './OfflineIndicator';
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

// Fonction utilitaire pour obtenir la couleur selon la difficulté
const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'debutant': return 'bg-green-100 text-green-800';
    case 'intermediaire': return 'bg-yellow-100 text-yellow-800';
    case 'avance': return 'bg-orange-100 text-orange-800';
    case 'expert': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

// Fonction utilitaire pour obtenir la couleur selon la catégorie
const getCategoryColor = (category: string) => {
  switch (category) {
    case 'orthographe': return 'bg-blue-100 text-blue-800';
    case 'conjugaison': return 'bg-purple-100 text-purple-800';
    case 'ponctuation': return 'bg-indigo-100 text-indigo-800';
    case 'syntaxe': return 'bg-pink-100 text-pink-800';
    default: return 'bg-gray-100 text-gray-800';
  }
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
  const [authMode, setAuthMode] = React.useState<'signin' | 'signup'>('signin');
  const [showProfileModal, setShowProfileModal] = React.useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = React.useState<string>('all');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
  
  React.useEffect(() => {
    setCurrentUser(getCurrentUser());
  }, []);

  const progressManager = React.useMemo(() => {
    const pm = new ProgressManager();
    return pm;
  }, []);

  const stats = progressManager.getProgressStats(lessons);
  const nextLesson = progressManager.getNextLesson(lessons);

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="flex items-center justify-between mb-6">
            <Logo size="large" />
            
            {/* User Menu or Login Button */}
            <div className="flex items-center gap-4">
              <PWAInstallButton />
              {currentUser && currentUser.id !== 'guest' ? (
                <UserMenu 
                  user={currentUser}
                  onLogout={handleLogout}
                  onEditProfile={() => setShowProfileModal(true)}
                />
              ) : (
                <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                {...getButtonAriaAttributes('Ouvrir la modal de connexion')}
              >
                <LogIn className="w-4 h-4" />
                Se connecter
              </button>
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

        {/* Filtres */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="font-semibold text-gray-800 mb-4">Filtrer les leçons</h3>
          <div className="flex flex-wrap gap-4">
            <div>
              <label 
                htmlFor="difficulty-filter" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Niveau de difficulté
              </label>
              <select
                id="difficulty-filter"
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-describedby="difficulty-help"
              >
                <option value="all">Tous les niveaux</option>
                <option value="debutant">Débutant (CM1-CM2)</option>
                <option value="intermediaire">Intermédiaire (6e-5e)</option>
                <option value="avance">Avancé (4e-3e)</option>
                <option value="expert">Expert (Lycée)</option>
              </select>
              <div id="difficulty-help" className="sr-only">
                Filtrer les leçons par niveau de difficulté
              </div>
            </div>
            <div>
              <label 
                htmlFor="category-filter" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Catégorie
              </label>
              <select
                id="category-filter"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-describedby="category-help"
              >
                <option value="all">Toutes les catégories</option>
                <option value="orthographe">Orthographe</option>
                <option value="conjugaison">Conjugaison</option>
                <option value="ponctuation">Ponctuation</option>
                <option value="syntaxe">Syntaxe</option>
              </select>
              <div id="category-help" className="sr-only">
                Filtrer les leçons par catégorie de contenu
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
                className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 lesson-card ${
                  isUnlocked ? 'hover:shadow-xl' : 'opacity-50'
                }`}
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
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                        isCompleted && hasPassingScore ? 'bg-green-500' : 
                        isCompleted ? 'bg-yellow-500' : 
                        isUnlocked ? 'bg-blue-500' : 'bg-gray-400'
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
                              hasPassingScore ? 'text-green-600' : 'text-yellow-600'
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

      {currentUser && currentUser.id !== 'guest' && (
        <ProfileModal
          isOpen={showProfileModal}
          user={currentUser}
          onClose={() => setShowProfileModal(false)}
          onUpdateProfile={handleProfileUpdate}
        />
      )}

      <OfflineIndicator />
    </div>
  );
};

export default Dashboard;