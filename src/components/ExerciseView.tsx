import React from 'react';
import { ArrowLeft, ArrowRight, Check, X, Volume2, HelpCircle, Move, RotateCcw } from 'lucide-react';
import { Exercise, Lesson } from '../types';
import { playSuccessSound, playErrorSound, speak } from '../utils/audio';
import ProgressBar from './ProgressBar';

interface ExerciseViewProps {
  lesson: Lesson;
  exercises: Exercise[];
  currentIndex: number;
  onBack: () => void;
  onNext: () => void;
  onComplete: (score: number) => void;
}

const ExerciseView: React.FC<ExerciseViewProps> = ({
  lesson,
  exercises,
  currentIndex,
  onBack,
  onNext,
  onComplete,
}) => {
  const [userAnswer, setUserAnswer] = React.useState<string>('');
  const [isAnswered, setIsAnswered] = React.useState(false);
  const [isCorrect, setIsCorrect] = React.useState(false);
  const [showFeedback, setShowFeedback] = React.useState(false);
  const [showHint, setShowHint] = React.useState(false);
  const [score, setScore] = React.useState(0);
  const [attemptCount, setAttemptCount] = React.useState(0);
  const [draggedItem, setDraggedItem] = React.useState<string | null>(null);
  const [dropZoneActive, setDropZoneActive] = React.useState(false);

  const currentExercise = exercises[currentIndex];
  const isLastExercise = currentIndex === exercises.length - 1;
  const totalExercises = exercises.length;

  React.useEffect(() => {
    setUserAnswer('');
    setIsAnswered(false);
    setIsCorrect(false);
    setShowFeedback(false);
    setShowHint(false);
    setAttemptCount(0);
    setDraggedItem(null);
    setDropZoneActive(false);
  }, [currentIndex]);

  const handleSubmit = () => {
    if (userAnswer.trim() === '') return;

    setAttemptCount(prev => prev + 1);

    const correct = Array.isArray(currentExercise.answer)
      ? currentExercise.answer.includes(userAnswer.toLowerCase().trim())
      : userAnswer.toLowerCase().trim() === currentExercise.answer.toLowerCase();

    setIsCorrect(correct);
    setIsAnswered(true);
    setShowFeedback(true);

    if (correct) {
      setScore(score + 1);
      playSuccessSound();
    } else {
      playErrorSound();
    }

    setTimeout(() => {
      const feedbackText = correct ? currentExercise.feedbackCorrect : currentExercise.feedbackIncorrect;
      speak(feedbackText);
    }, 500);
  };

  const handleNext = () => {
    if (isLastExercise) {
      const finalScore = Math.round((score / exercises.length) * 100);
      onComplete(finalScore);
    } else {
      onNext();
    }
  };

  const handleOptionClick = (option: string) => {
    setAttemptCount(prev => prev + 1);
    setUserAnswer(option);
    
    const correct = option.toLowerCase() === currentExercise.answer.toLowerCase();
    setIsCorrect(correct);
    setIsAnswered(true);
    setShowFeedback(true);

    if (correct) {
      setScore(score + 1);
      playSuccessSound();
    } else {
      playErrorSound();
    }

    setTimeout(() => {
      const feedbackText = correct ? currentExercise.feedbackCorrect : currentExercise.feedbackIncorrect;
      speak(feedbackText);
    }, 500);
  };

  const handleRetry = () => {
    setUserAnswer('');
    setIsAnswered(false);
    setIsCorrect(false);
    setShowFeedback(false);
    setShowHint(true); // Affiche l'indice après une erreur
  };

  const handleDragStart = (e: React.DragEvent, item: string) => {
    setDraggedItem(item);
    e.dataTransfer.setData('text/plain', item);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDropZoneActive(true);
  };

  const handleDragLeave = () => {
    setDropZoneActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDropZoneActive(false);
    const droppedItem = e.dataTransfer.getData('text/plain');
    
    setAttemptCount(prev => prev + 1);
    setUserAnswer(droppedItem);
    
    const correct = droppedItem.toLowerCase() === currentExercise.answer.toLowerCase();
    setIsCorrect(correct);
    setIsAnswered(true);
    setShowFeedback(true);

    if (correct) {
      setScore(score + 1);
      playSuccessSound();
    } else {
      playErrorSound();
    }

    setTimeout(() => {
      const feedbackText = correct ? currentExercise.feedbackCorrect : currentExercise.feedbackIncorrect;
      speak(feedbackText);
    }, 500);
  };

  const handleDictationPlay = () => {
    const textToSpeak = currentExercise.audioText || currentExercise.sentence;
    speak(textToSpeak);
  };

  const getScoreColor = () => {
    const percentage = Math.round((score / totalExercises) * 100);
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const renderExerciseContent = () => {
    switch (currentExercise.type) {
      case 'qcm':
        return (
          <div className="space-y-4">
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-lg text-gray-800 mb-4">
                {currentExercise.sentence}
              </p>
              <div className="grid gap-3">
                {currentExercise.options?.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => !isAnswered && handleOptionClick(option)}
                    disabled={isAnswered}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      isAnswered
                        ? option === currentExercise.answer
                          ? 'bg-green-100 border-green-500 text-green-800'
                          : userAnswer === option
                          ? 'bg-red-100 border-red-500 text-red-800'
                          : 'bg-gray-100 border-gray-300 text-gray-600'
                        : 'bg-white border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'fill-in-the-blank':
        return (
          <div className="space-y-4">
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-lg text-gray-800 mb-4">
                {currentExercise.sentence}
              </p>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  className="flex-1 p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Tapez votre réponse..."
                  disabled={isAnswered}
                  onKeyPress={(e) => e.key === 'Enter' && !isAnswered && handleSubmit()}
                />
                <button
                  onClick={handleSubmit}
                  disabled={isAnswered || userAnswer.trim() === ''}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Vérifier
                </button>
              </div>
            </div>
          </div>
        );

      case 'drag-drop':
        return (
          <div className="space-y-4">
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-lg text-gray-800 mb-4">
                Glisse la bonne réponse dans la phrase :
              </p>
              <div className="flex items-center gap-2 mb-6 text-lg">
                {currentExercise.sentence.split('___').map((part, index) => (
                  <React.Fragment key={index}>
                    <span>{part}</span>
                    {index < currentExercise.sentence.split('___').length - 1 && (
                      <div
                        className={`min-w-[100px] h-12 border-2 border-dashed rounded-lg flex items-center justify-center transition-all ${
                          dropZoneActive
                            ? 'border-blue-500 bg-blue-50'
                            : isAnswered
                            ? isCorrect
                              ? 'border-green-500 bg-green-50'
                              : 'border-red-500 bg-red-50'
                            : 'border-gray-400 bg-gray-50'
                        }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                      >
                        {userAnswer && (
                          <span className={`font-medium ${
                            isAnswered
                              ? isCorrect
                                ? 'text-green-800'
                                : 'text-red-800'
                              : 'text-gray-800'
                          }`}>
                            {userAnswer}
                          </span>
                        )}
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
              
              <div className="flex gap-3 justify-center">
                {currentExercise.options?.map((option, index) => (
                  <div
                    key={index}
                    draggable={!isAnswered}
                    onDragStart={(e) => handleDragStart(e, option)}
                    className={`px-4 py-2 rounded-lg border-2 cursor-move transition-all ${
                      !isAnswered
                        ? 'bg-white border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                        : draggedItem === option
                        ? 'bg-gray-200 border-gray-400 opacity-50'
                        : 'bg-gray-100 border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Move className="w-4 h-4 text-gray-500" />
                      <span>{option}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'transformation':
        return (
          <div className="space-y-4">
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-lg text-gray-800 mb-2">
                <strong>Phrase de départ :</strong>
              </p>
              <p className="text-lg text-blue-800 mb-4 font-medium">
                {currentExercise.sentence}
              </p>
              <p className="text-lg text-gray-800 mb-4">
                <strong>Consigne :</strong> {currentExercise.instruction}
              </p>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  className="flex-1 p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Écris ta transformation..."
                  disabled={isAnswered}
                  onKeyPress={(e) => e.key === 'Enter' && !isAnswered && handleSubmit()}
                />
                <button
                  onClick={handleSubmit}
                  disabled={isAnswered || userAnswer.trim() === ''}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Vérifier
                </button>
              </div>
            </div>
          </div>
        );

      case 'dictation':
        return (
          <div className="space-y-4">
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-lg text-gray-800 mb-4">
                Écoute attentivement et écris ce que tu entends :
              </p>
              <div className="flex justify-center mb-6">
                <button
                  onClick={handleDictationPlay}
                  className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <Volume2 className="w-5 h-5" />
                  Écouter la dictée
                </button>
              </div>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  className="flex-1 p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Écris ce que tu entends..."
                  disabled={isAnswered}
                  onKeyPress={(e) => e.key === 'Enter' && !isAnswered && handleSubmit()}
                />
                <button
                  onClick={handleSubmit}
                  disabled={isAnswered || userAnswer.trim() === ''}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Vérifier
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour à la leçon
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-800">{lesson.title}</h1>
            <button
              onClick={() => speak(lesson.title)}
              className="p-1 text-gray-500 hover:text-blue-500 transition-colors"
              title="Écouter le titre"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <ProgressBar 
            current={currentIndex + 1} 
            total={totalExercises}
            className="mb-4"
          />
          <div className="text-center text-sm text-gray-600">
            Exercice {currentIndex + 1} sur {totalExercises}
          </div>
        </div>

        {/* Exercise */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Exercice {currentIndex + 1}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowHint(!showHint)}
                className="flex items-center gap-2 px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors"
              >
                <HelpCircle className="w-4 h-4" />
                Indice
              </button>
              <button
                onClick={() => speak(currentExercise.sentence)}
                className="p-2 text-gray-500 hover:text-blue-500 transition-colors"
                title="Écouter l'énoncé"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {showHint && currentExercise.hint && (
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg mb-6">
              <p className="text-yellow-800">
                <strong>Indice :</strong> {currentExercise.hint}
              </p>
            </div>
          )}

          {renderExerciseContent()}

          {/* Feedback */}
          {showFeedback && (
            <div className={`mt-6 p-4 rounded-lg border-l-4 ${
              isCorrect 
                ? 'bg-green-50 border-green-500' 
                : 'bg-red-50 border-red-500'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {isCorrect ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <X className="w-5 h-5 text-red-600" />
                )}
                <span className={`font-semibold ${
                  isCorrect ? 'text-green-800' : 'text-red-800'
                }`}>
                  {isCorrect ? 'Correct !' : 'Incorrect'}
                </span>
              </div>
              <p className={`${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                {isCorrect ? currentExercise.feedbackCorrect : currentExercise.feedbackIncorrect}
              </p>
              {!isCorrect && (
                <p className="text-gray-600 mt-2">
                  <strong>Bonne réponse :</strong> {currentExercise.answer}
                </p>
              )}
              {!isCorrect && attemptCount === 1 && (
                <button
                  onClick={handleRetry}
                  className="mt-2 px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Réessayer
                </button>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <div className={`text-sm font-medium ${getScoreColor()}`}>
            Score actuel : {score}/{totalExercises} ({Math.round((score / totalExercises) * 100)}%)
          </div>
          
          {isAnswered && (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              {isLastExercise ? 'Terminer' : 'Suivant'}
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExerciseView;