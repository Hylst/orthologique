import React from 'react';
import { Lesson, AppState, UserProfile } from './types';
import { ProgressManager } from './utils/progressManager';
import { initAudio } from './utils/audio';
import { getCurrentUser } from './utils/storage';
import Dashboard from './components/Dashboard';
import LessonView from './components/LessonView';
import ExerciseView from './components/ExerciseView';
import ResultsView from './components/ResultsView';
import { showLessonCompleted } from './utils/notifications';
import { ModularLessonSystem } from './data/index';
import './data/utils/testMigration';

/**
 * Main App component that manages the application state and routing
 * Implements lazy loading for lessons data to improve initial load performance
 */
const App: React.FC = () => {
  const [progressManager] = React.useState(() => new ProgressManager());
  const [appState, setAppState] = React.useState<AppState>({
    currentView: 'dashboard',
    currentLessonId: null,
    currentExerciseIndex: 0,
    userProgress: progressManager.getProgress(),
    lessons: [],
    isLoading: true,
    authState: {
      isAuthenticated: false,
      currentUser: null,
      showAuthModal: false,
      authMode: 'signin'
    }
  });

  const [exerciseScore, setExerciseScore] = React.useState<number>(0);

  React.useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize the new modular lesson system
        const lessonSystem = new ModularLessonSystem();
        
        await initAudio();
        const currentUser = getCurrentUser();
        const userProgress = progressManager.getProgress();
        
        // Load lessons using the new modular system
        // Load all difficulty levels from modular structure
        let allLessons: Lesson[] = [];
        
        try {
          // Load débutant lessons from new modular structure
          const debutantLessons = await lessonSystem.getLessonsByDifficulty('debutant');
          // Transform debutant lessons to include unlocked/completed properties
          const transformedDebutantLessons = debutantLessons.map((lesson) => ({
            ...lesson,
            unlocked: false, // Will be set properly below
            completed: false // Will be set properly below
          }));
          allLessons.push(...transformedDebutantLessons);
        } catch (debutantError) {
          console.warn('Could not load débutant lessons from modular structure:', debutantError);
        }
        
        try {
          // Load intermediate lessons from new modular structure
          const intermediateLessons = await lessonSystem.getLessonsByDifficulty('intermediaire');
          // Transform intermediate lessons to include unlocked/completed properties
          const transformedIntermediateLessons = intermediateLessons.map((lesson) => ({
            ...lesson,
            unlocked: false, // Will be set properly below
            completed: false // Will be set properly below
          }));
          allLessons.push(...transformedIntermediateLessons);
        } catch (intermediateError) {
          console.warn('Could not load intermediate lessons from modular structure:', intermediateError);
        }
        
        try {
          // Load avancé lessons from new modular structure
          const avanceLessons = await lessonSystem.getLessonsByDifficulty('avance');
          // Transform avancé lessons to include unlocked/completed properties
          const transformedAvanceLessons = avanceLessons.map((lesson) => ({
            ...lesson,
            unlocked: false, // Will be set properly below
            completed: false // Will be set properly below
          }));
          allLessons.push(...transformedAvanceLessons);
        } catch (avanceError) {
          console.warn('Could not load avancé lessons from modular structure:', avanceError);
        }
        
        try {
          // Load expert lessons from new modular structure
          const expertLessons = await lessonSystem.getLessonsByDifficulty('expert');
          // Transform expert lessons to include unlocked/completed properties
          const transformedExpertLessons = expertLessons.map((lesson) => ({
            ...lesson,
            unlocked: false, // Will be set properly below
            completed: false // Will be set properly below
          }));
          allLessons.push(...transformedExpertLessons);
        } catch (expertError) {
          console.warn('Could not load expert lessons from modular structure:', expertError);
        }
        
        // Fallback to legacy system if no lessons were loaded from modular structure
        if (allLessons.length === 0) {
          console.log('Falling back to legacy lessons.json');
          const lessonsModule = await import('./data/lessons.json');
          // Transform legacy lessons to include unlocked/completed properties
          allLessons = lessonsModule.default.lessons.map((lesson: any) => ({
            ...lesson,
            unlocked: false,
            completed: false
          }));
        }
        
        // Transform lesson data to include unlocked and completed properties
        const transformedLessons: Lesson[] = allLessons.map((lesson: any, index: number) => ({
          ...lesson,
          unlocked: index === 0 || userProgress.completedLessons.includes(allLessons[index - 1]?.id),
          completed: userProgress.completedLessons.includes(lesson.id)
        }));
        
        setAppState(prev => ({
          ...prev,
          userProgress,
          lessons: transformedLessons,
          isLoading: false,
          authState: {
            ...prev.authState,
            isAuthenticated: currentUser !== null && currentUser.id !== 'guest',
            currentUser
          }
        }));
      } catch (error) {
        console.error('Failed to load lessons data:', error);
        setAppState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initializeApp();
  }, [progressManager]);

  const handleStartLesson = (lessonId: string) => {
    // Vérifie si la leçon peut être débloquée
    if (!progressManager.canAccessLesson(lessonId, appState.lessons)) {
      return;
    }
    
    progressManager.updateLastPosition(lessonId);
    setAppState(prev => ({
      ...prev,
      currentView: 'lesson',
      currentLessonId: lessonId,
      userProgress: progressManager.getProgress(),
    }));
  };

  const handleStartExercises = () => {
    setAppState(prev => ({
      ...prev,
      currentView: 'exercise',
      currentExerciseIndex: 0,
    }));
  };

  const handleNextExercise = () => {
    setAppState(prev => ({
      ...prev,
      currentExerciseIndex: prev.currentExerciseIndex + 1,
    }));
  };

  const handleExerciseComplete = (score: number) => {
    if (!appState.currentLessonId) return;

    const currentLesson = appState.lessons.find(l => l.id === appState.currentLessonId);
    progressManager.completeLesson(appState.currentLessonId, score);
    
    // Afficher une notification de fin de leçon
    if (currentLesson) {
      showLessonCompleted(currentLesson.title, score);
    }
    
    setExerciseScore(score);
    setAppState(prev => ({
      ...prev,
      currentView: 'results',
      userProgress: progressManager.getProgress(),
    }));
  };

  const handleRetryExercises = () => {
    setAppState(prev => ({
      ...prev,
      currentView: 'exercise',
      currentExerciseIndex: 0,
    }));
  };

  const handleBackToDashboard = () => {
    setAppState(prev => ({
      ...prev,
      currentView: 'dashboard',
      currentLessonId: null,
      currentExerciseIndex: 0,
    }));
  };

  const handleBackToLesson = () => {
    setAppState(prev => ({
      ...prev,
      currentView: 'lesson',
    }));
  };

  const handleResetProgress = () => {
    progressManager.resetProgress();
    setAppState(prev => ({
      ...prev,
      currentView: 'dashboard',
      currentLessonId: null,
      currentExerciseIndex: 0,
      userProgress: progressManager.getProgress(),
    }));
  };

  const handleUpdateUserProfile = (profile: UserProfile) => {
    progressManager.updateUserProfile(profile);
    setAppState(prev => ({
      ...prev,
      userProgress: progressManager.getProgress(),
      authState: {
        ...prev.authState,
        currentUser: profile,
        isAuthenticated: profile.id !== 'guest'
      }
    }));
  };

  // Traite les leçons avec les statuts de déblocage corrects
  const processedLessons = appState.lessons.map(lesson => ({
    ...lesson,
    unlocked: progressManager.canUnlockLesson(lesson.id, appState.lessons),
    completed: progressManager.isLessonCompleted(lesson.id),
  }));

  if (appState.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement d'OrthoLogique...</p>
        </div>
      </div>
    );
  }

  const currentLesson = appState.currentLessonId 
    ? processedLessons.find(l => l.id === appState.currentLessonId)
    : null;

  switch (appState.currentView) {
    case 'lesson':
      return currentLesson ? (
        <LessonView
          lesson={currentLesson}
          onBack={handleBackToDashboard}
          onStartExercises={handleStartExercises}
        />
      ) : (
        <div>Leçon non trouvée</div>
      );

    case 'exercise':
      return currentLesson ? (
        <ExerciseView
          lesson={currentLesson}
          exercises={currentLesson.exercises}
          currentIndex={appState.currentExerciseIndex}
          onBack={handleBackToLesson}
          onNext={handleNextExercise}
          onComplete={handleExerciseComplete}
        />
      ) : (
        <div>Exercice non trouvé</div>
      );

    case 'results':
      return currentLesson ? (
        <ResultsView
          lessonTitle={currentLesson.title}
          score={exerciseScore}
          totalExercises={currentLesson.exercises.length}
          passingScore={currentLesson.passingScore}
          onRetry={handleRetryExercises}
          onBackToDashboard={handleBackToDashboard}
        />
      ) : (
        <div>Résultats non disponibles</div>
      );

    case 'dashboard':
    default:
      return (
        <Dashboard
          lessons={processedLessons}
          userProgress={appState.userProgress}
          onStartLesson={handleStartLesson}
          onResetProgress={handleResetProgress}
          onUpdateUserProfile={handleUpdateUserProfile}
        />
      );
  }
};

export default App;