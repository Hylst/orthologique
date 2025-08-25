import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Lightbulb, Eye, Volume2, Quote } from 'lucide-react';
import { Lesson } from '../types';
import { speak } from '../utils/audio';
import { useTouchGestures } from '../hooks/useTouchGestures';
import { HapticFeedback, MobileViewport } from '../utils/mobileInteractions';

interface LessonViewProps {
  lesson: Lesson;
  onBack: () => void;
  onStartExercises: () => void;
}

const LessonView: React.FC<LessonViewProps> = ({ lesson, onBack, onStartExercises }) => {
  const [currentSection, setCurrentSection] = React.useState(0);
  const [isMobile, setIsMobile] = useState(false);
  
  // Mobile detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(MobileViewport.isMobile());
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Enhanced speak function with haptic feedback
  const handleSpeak = (text: string) => {
    speak(text);
    HapticFeedback.selection();
  };
  
  // Enhanced section change with haptic feedback
  const handleSectionChange = (newSection: number) => {
    setCurrentSection(newSection);
    HapticFeedback.navigation();
  };
  
  // Enhanced back function with haptic feedback
  const handleBack = () => {
    onBack();
    HapticFeedback.navigation();
  };
  
  // Enhanced start exercises with haptic feedback
  const handleStartExercises = () => {
    onStartExercises();
    HapticFeedback.success();
  };
  
  // Define sections first
  const sections = [
    {
      title: 'La Règle',
      icon: <Eye className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-blue-800">Règle à retenir</h3>
              <button
                onClick={() => handleSpeak(lesson.rule)}
                className="p-1 text-blue-600 hover:text-blue-800 transition-colors touch-button touch-feedback"
                title="Écouter la règle"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-blue-700 text-lg">{lesson.rule}</p>
          </div>
          
          {/* Contexte étymologique */}
          {lesson.etymology && (
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-amber-800">Étymologie</h3>
                <button
                  onClick={() => handleSpeak(lesson.etymology!)}
                  className="p-1 text-amber-600 hover:text-amber-800 transition-colors touch-button touch-feedback"
                  title="Écouter l'étymologie"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-amber-700">{lesson.etymology}</p>
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Exemples',
      icon: <Quote className="w-5 h-5" />,
      content: (
        <div className="space-y-3">
          {lesson.examples.map((example, index) => (
            <div key={index} className="bg-green-50 border border-green-200 p-3 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-green-800">{example}</span>
                <button
                  onClick={() => handleSpeak(example)}
                  className="p-1 text-green-600 hover:text-green-800 transition-colors touch-button touch-feedback"
                  title="Écouter l'exemple"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )
    },
    {
      title: 'Astuces',
      icon: <Lightbulb className="w-5 h-5" />,
      content: (
        <div className="space-y-3">
          {lesson.tips?.map((tip, index) => (
            <div key={index} className="bg-purple-50 border-l-4 border-purple-500 p-3 rounded-r-lg">
              <div className="flex items-start justify-between">
                <p className="text-purple-700 flex-1">{tip}</p>
                <button
                  onClick={() => handleSpeak(tip)}
                  className="p-1 text-purple-600 hover:text-purple-800 transition-colors ml-2 touch-button touch-feedback"
                  title="Écouter l'astuce"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )
    }
  ];
  
  // Touch gestures for navigation (now sections is defined)
  const { onTouchStart, onTouchMove, onTouchEnd } = useTouchGestures({
    onSwipeLeft: () => {
      if (currentSection < sections.length - 1) {
        handleSectionChange(currentSection + 1);
      }
    },
    onSwipeRight: () => {
      if (currentSection > 0) {
        handleSectionChange(currentSection - 1);
      } else {
        handleBack();
      }
    }
  });
  




  return (
    <div 
      className={`min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 ${
        isMobile ? 'safe-area-top safe-area-bottom' : ''
      }`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handleBack}
            className={`flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors ${
              isMobile ? 'touch-button touch-feedback' : ''
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
            {isMobile ? 'Retour' : 'Retour au tableau de bord'}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
              {lesson.level}
            </div>
            <h1 className="text-2xl font-bold text-gray-800">{lesson.title}</h1>
            <button
              onClick={() => handleSpeak(lesson.title)}
              className="p-1 text-gray-500 hover:text-blue-500 transition-colors"
              title="Écouter le titre"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Section {currentSection + 1} sur {sections.length}
            </span>
            <span className="text-sm text-gray-500">
              {sections[currentSection].title}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentSection + 1) / sections.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className={`bg-white rounded-xl shadow-lg p-8 mb-8 ${
          isMobile ? 'swipe-indicator' : ''
        }`}>
          <div className="flex items-center gap-3 mb-6">
            {sections[currentSection].icon}
            <h2 className="text-xl font-semibold text-gray-800">
              {sections[currentSection].title}
            </h2>
            <button
              onClick={() => handleSpeak(sections[currentSection].title)}
              className={`p-1 text-gray-500 hover:text-blue-500 transition-colors ${
                isMobile ? 'touch-button touch-feedback' : ''
              }`}
              title="Écouter le titre de la section"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
          {isMobile && (
            <div className="text-center text-sm text-gray-500 mb-4">
              👈 Glissez pour naviguer 👉
            </div>
          )}
          {sections[currentSection].content}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => handleSectionChange(Math.max(0, currentSection - 1))}
            disabled={currentSection === 0}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              currentSection === 0
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
            } ${isMobile ? 'touch-button touch-feedback' : ''}`}
          >
            <ArrowLeft className="w-5 h-5" />
            {isMobile ? 'Préc.' : 'Précédent'}
          </button>

          {currentSection === sections.length - 1 ? (
            <button
              onClick={handleStartExercises}
              className={`flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors ${
                isMobile ? 'touch-button touch-feedback' : ''
              }`}
            >
              {isMobile ? 'Exercices' : 'Commencer les exercices'}
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={() => handleSectionChange(Math.min(sections.length - 1, currentSection + 1))}
              className={`flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors ${
                isMobile ? 'touch-button touch-feedback' : ''
              }`}
            >
              Suivant
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonView;