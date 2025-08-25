import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, AlertTriangle, Users, MessageSquare, Clock, Target, TestTube, Star, ChevronDown, ChevronUp } from 'lucide-react';
// Removed unused import

interface EngagementMetrics {
  totalTimeSpent: number; // in minutes
  sessionsCount: number;
  averageSessionDuration: number;
  streakDays: number;
  lastActiveDate: string;
}

interface ErrorPattern {
  exerciseType: string;
  errorCount: number;
  errorRate: number;
  commonMistakes: string[];
}

interface PedagogicalEffectiveness {
  improvementRate: number;
  difficultyProgression: number;
  retentionRate: number;
  masteryLevel: number;
}

interface ABTestResult {
  testName: string;
  variant: 'A' | 'B';
  conversionRate: number;
  isActive: boolean;
}

interface UserFeedback {
  id: string;
  rating: number;
  comment: string;
  date: string;
  exerciseId?: string;
}

interface AdvancedDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Advanced Dashboard component providing comprehensive analytics and insights
 * for user engagement, learning effectiveness, and system performance
 */
const AdvancedDashboard: React.FC<AdvancedDashboardProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'engagement' | 'errors' | 'effectiveness' | 'testing' | 'feedback'>('engagement');
  const [engagementData, setEngagementData] = useState<EngagementMetrics | null>(null);
  const [errorPatterns, setErrorPatterns] = useState<ErrorPattern[]>([]);
  const [effectiveness, setEffectiveness] = useState<PedagogicalEffectiveness | null>(null);
  const [abTests, setABTests] = useState<ABTestResult[]>([]);
  const [feedbacks, setFeedbacks] = useState<UserFeedback[]>([]);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  /**
   * Load engagement metrics from localStorage and calculate statistics
   */
  const loadEngagementMetrics = () => {
    try {
      const sessions = JSON.parse(localStorage.getItem('user-sessions') || '[]');
      const totalTime = sessions.reduce((sum: number, session: any) => sum + (session.duration || 0), 0);
      const avgDuration = sessions.length > 0 ? totalTime / sessions.length : 0;
      
      // Calculate streak days
      const sortedSessions = sessions.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      let streak = 0;
      let currentDate = new Date();
      
      for (const session of sortedSessions) {
        const sessionDate = new Date(session.date);
        const daysDiff = Math.floor((currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff <= streak + 1) {
          streak++;
          currentDate = sessionDate;
        } else {
          break;
        }
      }

      setEngagementData({
        totalTimeSpent: Math.round(totalTime),
        sessionsCount: sessions.length,
        averageSessionDuration: Math.round(avgDuration),
        streakDays: streak,
        lastActiveDate: sortedSessions[0]?.date || new Date().toISOString()
      });
    } catch (error) {
      console.error('Error loading engagement metrics:', error);
    }
  };

  /**
   * Analyze error patterns from user progress data
   */
  const analyzeErrorPatterns = () => {
    try {
      const progress = JSON.parse(localStorage.getItem('user-progress') || '{}');
      const patterns: { [key: string]: ErrorPattern } = {};

      Object.entries(progress).forEach(([_lessonId, lessonData]: [string, any]) => {
        if (lessonData.exercises) {
          Object.entries(lessonData.exercises).forEach(([_exerciseId, exerciseData]: [string, any]) => {
            const exerciseType = exerciseData.type || 'unknown';
            const errors = exerciseData.errors || 0;
            const attempts = exerciseData.attempts || 1;
            
            if (!patterns[exerciseType]) {
              patterns[exerciseType] = {
                exerciseType,
                errorCount: 0,
                errorRate: 0,
                commonMistakes: []
              };
            }
            
            patterns[exerciseType].errorCount += errors;
            patterns[exerciseType].errorRate = (patterns[exerciseType].errorCount / attempts) * 100;
            
            // Add common mistakes if available
            if (exerciseData.commonMistakes) {
              patterns[exerciseType].commonMistakes.push(...exerciseData.commonMistakes);
            }
          });
        }
      });

      setErrorPatterns(Object.values(patterns).sort((a, b) => b.errorCount - a.errorCount));
    } catch (error) {
      console.error('Error analyzing error patterns:', error);
    }
  };

  /**
   * Calculate pedagogical effectiveness metrics
   */
  const calculateEffectiveness = () => {
    try {
      const progress = JSON.parse(localStorage.getItem('user-progress') || '{}');
      
      let totalExercises = 0;
      let completedExercises = 0;
      let totalScore = 0;
      let improvementSum = 0;
      let improvementCount = 0;

      Object.values(progress).forEach((lessonData: any) => {
        if (lessonData.exercises) {
          Object.values(lessonData.exercises).forEach((exerciseData: any) => {
            totalExercises++;
            if (exerciseData.completed) {
              completedExercises++;
              totalScore += exerciseData.score || 0;
              
              // Calculate improvement if multiple attempts
              if (exerciseData.attempts > 1 && exerciseData.scoreHistory) {
                const scores = exerciseData.scoreHistory;
                if (scores.length > 1) {
                  const improvement = scores[scores.length - 1] - scores[0];
                  improvementSum += improvement;
                  improvementCount++;
                }
              }
            }
          });
        }
      });

      const avgScore = completedExercises > 0 ? totalScore / completedExercises : 0;
      const avgImprovement = improvementCount > 0 ? improvementSum / improvementCount : 0;
      const completionRate = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;

      setEffectiveness({
        improvementRate: Math.round(avgImprovement * 100) / 100,
        difficultyProgression: Math.round(completionRate),
        retentionRate: Math.round(avgScore),
        masteryLevel: Math.round((avgScore + completionRate) / 2)
      });
    } catch (error) {
      console.error('Error calculating effectiveness:', error);
    }
  };

  /**
   * Load A/B test results (mock data for demonstration)
   */
  const loadABTests = () => {
    const mockTests: ABTestResult[] = [
      {
        testName: 'Interface Couleurs',
        variant: 'A',
        conversionRate: 78.5,
        isActive: true
      },
      {
        testName: 'Système de Récompenses',
        variant: 'B',
        conversionRate: 82.3,
        isActive: true
      },
      {
        testName: 'Durée des Exercices',
        variant: 'A',
        conversionRate: 75.1,
        isActive: false
      }
    ];
    setABTests(mockTests);
  };

  /**
   * Load user feedback from localStorage
   */
  const loadUserFeedback = () => {
    try {
      const feedback = JSON.parse(localStorage.getItem('user-feedback') || '[]');
      setFeedbacks(feedback.sort((a: UserFeedback, b: UserFeedback) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ));
    } catch (error) {
      console.error('Error loading user feedback:', error);
    }
  };

  /**
   * Toggle expanded sections for better UX
   */
  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  /**
   * Add new feedback entry
   */
  const addFeedback = (rating: number, comment: string, exerciseId?: string) => {
    const newFeedback: UserFeedback = {
      id: Date.now().toString(),
      rating,
      comment,
      date: new Date().toISOString(),
      exerciseId
    };
    
    const updatedFeedbacks = [newFeedback, ...feedbacks];
    setFeedbacks(updatedFeedbacks);
    localStorage.setItem('user-feedback', JSON.stringify(updatedFeedbacks));
  };

  useEffect(() => {
    if (isOpen) {
      loadEngagementMetrics();
      analyzeErrorPatterns();
      calculateEffectiveness();
      loadABTests();
      loadUserFeedback();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <BarChart3 className="w-6 h-6" />
                Tableaux de Bord Avancés
              </h2>
              <p className="text-blue-100 mt-1">Analyse approfondie des performances et de l'engagement</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
              aria-label="Fermer"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'engagement', label: 'Engagement', icon: Clock },
              { id: 'errors', label: 'Erreurs', icon: AlertTriangle },
              { id: 'effectiveness', label: 'Efficacité', icon: Target },
              { id: 'testing', label: 'A/B Tests', icon: TestTube },
              { id: 'feedback', label: 'Feedback', icon: MessageSquare }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Engagement Metrics Tab */}
          {activeTab === 'engagement' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Métriques d'Engagement</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 text-sm font-medium">Temps Total</p>
                      <p className="text-2xl font-bold text-blue-800">
                        {engagementData?.totalTimeSpent || 0} min
                      </p>
                    </div>
                    <Clock className="w-8 h-8 text-blue-500" />
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-600 text-sm font-medium">Sessions</p>
                      <p className="text-2xl font-bold text-green-800">
                        {engagementData?.sessionsCount || 0}
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-green-500" />
                  </div>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-600 text-sm font-medium">Durée Moyenne</p>
                      <p className="text-2xl font-bold text-purple-800">
                        {engagementData?.averageSessionDuration || 0} min
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-purple-500" />
                  </div>
                </div>
                
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-600 text-sm font-medium">Série</p>
                      <p className="text-2xl font-bold text-orange-800">
                        {engagementData?.streakDays || 0} jours
                      </p>
                    </div>
                    <Target className="w-8 h-8 text-orange-500" />
                  </div>
                </div>
              </div>
              
              {engagementData && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Dernière Activité</h4>
                  <p className="text-gray-600">
                    {new Date(engagementData.lastActiveDate).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Error Analysis Tab */}
          {activeTab === 'errors' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Analyse des Erreurs</h3>
              
              {errorPatterns.length > 0 ? (
                <div className="space-y-4">
                  {errorPatterns.map((pattern, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div 
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => toggleSection(`error-${index}`)}
                      >
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="w-5 h-5 text-red-500" />
                          <div>
                            <h4 className="font-semibold text-gray-800">{pattern.exerciseType}</h4>
                            <p className="text-sm text-gray-600">
                              {pattern.errorCount} erreurs • Taux: {pattern.errorRate.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                        {expandedSections.has(`error-${index}`) ? 
                          <ChevronUp className="w-5 h-5 text-gray-400" /> : 
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        }
                      </div>
                      
                      {expandedSections.has(`error-${index}`) && pattern.commonMistakes.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <h5 className="font-medium text-gray-700 mb-2">Erreurs Fréquentes:</h5>
                          <ul className="list-disc list-inside space-y-1">
                            {pattern.commonMistakes.slice(0, 5).map((mistake, idx) => (
                              <li key={idx} className="text-sm text-gray-600">{mistake}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Aucune donnée d'erreur disponible pour le moment.</p>
                </div>
              )}
            </div>
          )}

          {/* Pedagogical Effectiveness Tab */}
          {activeTab === 'effectiveness' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Efficacité Pédagogique</h3>
              
              {effectiveness && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">Taux d'Amélioration</h4>
                    <div className="flex items-center gap-2">
                      <div className="text-3xl font-bold text-green-700">
                        {effectiveness.improvementRate > 0 ? '+' : ''}{effectiveness.improvementRate}%
                      </div>
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                    <p className="text-sm text-green-600 mt-1">Progression moyenne par exercice</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Progression Difficulté</h4>
                    <div className="flex items-center gap-2">
                      <div className="text-3xl font-bold text-blue-700">
                        {effectiveness.difficultyProgression}%
                      </div>
                      <Target className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="text-sm text-blue-600 mt-1">Taux de complétion des exercices</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
                    <h4 className="font-semibold text-purple-800 mb-2">Taux de Rétention</h4>
                    <div className="flex items-center gap-2">
                      <div className="text-3xl font-bold text-purple-700">
                        {effectiveness.retentionRate}%
                      </div>
                      <BarChart3 className="w-6 h-6 text-purple-600" />
                    </div>
                    <p className="text-sm text-purple-600 mt-1">Score moyen des exercices</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg">
                    <h4 className="font-semibold text-orange-800 mb-2">Niveau de Maîtrise</h4>
                    <div className="flex items-center gap-2">
                      <div className="text-3xl font-bold text-orange-700">
                        {effectiveness.masteryLevel}%
                      </div>
                      <Star className="w-6 h-6 text-orange-600" />
                    </div>
                    <p className="text-sm text-orange-600 mt-1">Niveau global de compétence</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* A/B Testing Tab */}
          {activeTab === 'testing' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Tests A/B en Cours</h3>
              
              <div className="space-y-4">
                {abTests.map((test, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <TestTube className="w-5 h-5 text-blue-500" />
                        <div>
                          <h4 className="font-semibold text-gray-800">{test.testName}</h4>
                          <p className="text-sm text-gray-600">
                            Variante {test.variant} • Taux de conversion: {test.conversionRate}%
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          test.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {test.isActive ? 'Actif' : 'Terminé'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* User Feedback Tab */}
          {activeTab === 'feedback' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800">Feedback Utilisateur</h3>
                <button
                  onClick={() => {
                    const rating = parseInt(prompt('Note (1-5):') || '5');
                    const comment = prompt('Commentaire:') || '';
                    if (comment) {
                      addFeedback(rating, comment);
                    }
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Ajouter un Feedback
                </button>
              </div>
              
              {feedbacks.length > 0 ? (
                <div className="space-y-4">
                  {feedbacks.slice(0, 10).map((feedback) => (
                    <div key={feedback.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < feedback.rating 
                                      ? 'text-yellow-400 fill-current' 
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(feedback.date).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                          <p className="text-gray-700">{feedback.comment}</p>
                          {feedback.exerciseId && (
                            <p className="text-xs text-gray-500 mt-1">
                              Exercice: {feedback.exerciseId}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Aucun feedback disponible pour le moment.</p>
                  <p className="text-sm mt-2">Soyez le premier à partager votre expérience !</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedDashboard;