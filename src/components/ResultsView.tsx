import React from 'react';
import { Trophy, RotateCcw, Home, Star, Volume2, Target, BookOpen } from 'lucide-react';
import { speak, playProgressSound, clearSoundQueue } from '../utils/audio';

interface ResultsViewProps {
  lessonTitle: string;
  score: number;
  totalExercises: number;
  passingScore?: number;
  onRetry: () => void;
  onBackToDashboard: () => void;
}

const ResultsView: React.FC<ResultsViewProps> = ({
  lessonTitle,
  score,
  totalExercises,
  passingScore = 70,
  onRetry,
  onBackToDashboard,
}) => {
  const percentage = score;
  const correctAnswers = Math.round((score / 100) * totalExercises);
  const hasPassed = percentage >= passingScore;

  React.useEffect(() => {
    // Vide la file d'attente des sons précédents
    clearSoundQueue();
    
    playProgressSound();
    const message = hasPassed 
      ? `Félicitations ! Vous avez réussi la leçon ${lessonTitle} avec ${score}%`
      : `Vous avez obtenu ${score}% à la leçon ${lessonTitle}. Continuez vos efforts !`;
    setTimeout(() => speak(message), 1000);
  }, [score, lessonTitle, hasPassed]);

  const getScoreMessage = () => {
    if (percentage >= 90) return { 
      message: "Excellent ! Vous maîtrisez parfaitement cette règle !", 
      color: "text-green-600", 
      bgColor: "bg-green-50",
      stars: 3 
    };
    if (percentage >= passingScore) return { 
      message: "Très bien ! Vous avez bien compris la règle.", 
      color: "text-blue-600", 
      bgColor: "bg-blue-50",
      stars: 2 
    };
    if (percentage >= 50) return { 
      message: "C'est un bon début ! Continuez à vous entraîner.", 
      color: "text-yellow-600", 
      bgColor: "bg-yellow-50",
      stars: 1 
    };
    return { 
      message: "N'abandonnez pas ! Relisez la leçon et réessayez.", 
      color: "text-red-600", 
      bgColor: "bg-red-50",
      stars: 0 
    };
  };

  const scoreData = getScoreMessage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          {/* Trophy */}
          <div className="mb-6">
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${
              hasPassed 
                ? 'bg-gradient-to-br from-yellow-400 to-orange-500' 
                : 'bg-gradient-to-br from-gray-400 to-gray-500'
            }`}>
              {hasPassed ? (
                <Trophy className="w-10 h-10 text-white" />
              ) : (
                <Target className="w-10 h-10 text-white" />
              )}
            </div>
            <div className="flex justify-center gap-1 mb-4">
              {[...Array(3)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-6 h-6 ${i < scoreData.stars ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                />
              ))}
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {hasPassed ? 'Leçon réussie !' : 'Leçon terminée'}
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            {lessonTitle}
          </p>

          {/* Score */}
          <div className="mb-8">
            <div className={`text-6xl font-bold mb-4 ${
              hasPassed ? 'text-green-600' : 'text-yellow-600'
            }`}>
              {percentage}%
            </div>
            <p className="text-lg text-gray-700 mb-4">
              {correctAnswers} bonnes réponses sur {totalExercises}
            </p>
            
            {/* Passing score indicator */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${scoreData.bgColor} mb-4`}>
              {hasPassed ? (
                <Trophy className="w-5 h-5 text-green-600" />
              ) : (
                <BookOpen className="w-5 h-5 text-yellow-600" />
              )}
              <span className={`font-medium ${scoreData.color}`}>
                {hasPassed ? `Seuil de réussite atteint (${passingScore}%)` : `Seuil de réussite : ${passingScore}%`}
              </span>
            </div>
            
            <div className="flex items-center justify-center gap-2 mb-4">
              <p className={`text-lg font-semibold ${scoreData.color}`}>
                {scoreData.message}
              </p>
              <button
                onClick={() => speak(scoreData.message)}
                className="p-1 text-gray-500 hover:text-blue-500 transition-colors"
                title="Écouter le message"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>0%</span>
              <span className="text-gray-800 font-medium">{passingScore}% (seuil)</span>
              <span>100%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              {/* Passing score indicator */}
              <div 
                className="absolute h-4 w-1 bg-gray-400 rounded-full"
                style={{ left: `${passingScore}%`, transform: 'translateX(-50%)' }}
              />
              <div 
                className={`h-4 rounded-full transition-all duration-1000 ease-out ${
                  hasPassed 
                    ? 'bg-gradient-to-r from-green-500 to-blue-500' 
                    : 'bg-gradient-to-r from-yellow-500 to-orange-500'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {hasPassed ? (
              <button
                onClick={onBackToDashboard}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <Home className="w-5 h-5" />
                Continuer le parcours
              </button>
            ) : (
              <button
                onClick={onRetry}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
                Recommencer les exercices
              </button>
            )}
            
            <button
              onClick={onBackToDashboard}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-colors ${
                hasPassed 
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              <Home className="w-5 h-5" />
              Retour au tableau de bord
            </button>
            
            {hasPassed && (
              <button
                onClick={onRetry}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
                Réviser
              </button>
            )}
          </div>

          {/* Recommendation */}
          {hasPassed ? (
            <div className="mt-8 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
              <p className="text-green-800">
                🎉 Félicitations ! Vous pouvez maintenant passer à la leçon suivante.
              </p>
            </div>
          ) : (
            <div className="mt-8 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-lg">
              <p className="text-yellow-800">
                💪 Vous y êtes presque ! Relisez la leçon et réessayez pour débloquer la suite.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultsView;