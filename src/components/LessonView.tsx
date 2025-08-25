import React from 'react';
import { ArrowLeft, ArrowRight, Lightbulb, Eye, Volume2, BookOpen, AlertTriangle, Quote } from 'lucide-react';
import { Lesson } from '../types';
import { speak } from '../utils/audio';

interface LessonViewProps {
  lesson: Lesson;
  onBack: () => void;
  onStartExercises: () => void;
}

const LessonView: React.FC<LessonViewProps> = ({ lesson, onBack, onStartExercises }) => {
  const [currentSection, setCurrentSection] = React.useState(0);

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
                className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
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
                <h3 className="font-semibold text-amber-800 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Le saviez-vous ?
                </h3>
                <button
                  onClick={() => lesson.etymology && handleSpeak(lesson.etymology)}
                  className="p-1 text-amber-600 hover:text-amber-800 transition-colors"
                  title="Écouter l'étymologie"
                  disabled={!lesson.etymology}
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-amber-700 text-sm leading-relaxed">{lesson.etymology}</p>
            </div>
          )}
        </div>
      )
    },
    {
      title: 'L\'Explication',
      icon: <Lightbulb className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-yellow-800">Pourquoi cette règle ?</h3>
              <button
                onClick={() => handleSpeak(lesson.explanation)}
                className="p-1 text-yellow-600 hover:text-yellow-800 transition-colors"
                title="Écouter l'explication"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-yellow-700 leading-relaxed">{lesson.explanation}</p>
          </div>
        </div>
      )
    },
    {
      title: 'Trucs & Astuces',
      icon: <Lightbulb className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-purple-800">Astuce mnémotechnique</h3>
              <button
                onClick={() => handleSpeak(lesson.mnemonics)}
                className="p-1 text-purple-600 hover:text-purple-800 transition-colors"
                title="Écouter l'astuce"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-purple-700 text-lg font-medium">{lesson.mnemonics}</p>
          </div>
          
          {/* Cas particuliers */}
          {lesson.specialCases && lesson.specialCases.length > 0 && (
            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-orange-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Cas particuliers à retenir
                </h3>
                <button
                  onClick={() => handleSpeak(`Cas particuliers: ${lesson.specialCases?.map(c => c.title).join(', ')}`)}
                  className="p-1 text-orange-600 hover:text-orange-800 transition-colors"
                  title="Écouter les cas particuliers"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                {lesson.specialCases.map((specialCase, index) => (
                  <div key={index} className="border-l-2 border-orange-300 pl-3">
                    <h4 className="font-medium text-orange-800 mb-1">{specialCase.title}</h4>
                    <p className="text-orange-700 text-sm mb-2">{specialCase.description}</p>
                    <div className="space-y-1">
                      {specialCase.examples.map((example, exIndex) => (
                        <div key={exIndex} className="flex items-center justify-between bg-orange-100 px-2 py-1 rounded text-sm">
                          <span className="text-orange-800 font-mono">{example}</span>
                          <button
                            onClick={() => speak(example)}
                            className="p-1 text-orange-600 hover:text-orange-800 transition-colors"
                            title="Écouter l'exemple"
                          >
                            <Volume2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    {specialCase.tip && (
                      <p className="text-orange-600 text-xs mt-1 italic">💡 {specialCase.tip}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Exemples',
      icon: <Eye className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Exemples pratiques</h3>
            <div className="grid gap-3">
              {lesson.examples.map((example, index) => (
                <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-green-800 font-mono text-lg">{example}</p>
                    <button
                      onClick={() => speak(example)}
                      className="p-1 text-green-600 hover:text-green-800 transition-colors"
                      title="Écouter l'exemple"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Exemples littéraires */}
          {lesson.literaryExamples && lesson.literaryExamples.length > 0 && (
            <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-indigo-800 flex items-center gap-2">
                  <Quote className="w-4 h-4" />
                  Dans la littérature
                </h3>
                <button
                  onClick={() => handleSpeak('Exemples tirés de la littérature')}
                  className="p-1 text-indigo-600 hover:text-indigo-800 transition-colors"
                  title="Écouter le titre"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-4">
                {lesson.literaryExamples.map((literary, index) => (
                  <div key={index} className="border-l-2 border-indigo-300 pl-4">
                    <div className="bg-indigo-100 p-3 rounded-lg mb-2">
                      <div className="flex items-start justify-between">
                        <blockquote className="text-indigo-800 italic text-sm leading-relaxed flex-1">
                          "{literary.text}"
                        </blockquote>
                        <button
                          onClick={() => speak(literary.text)}
                          className="p-1 text-indigo-600 hover:text-indigo-800 transition-colors ml-2"
                          title="Écouter la citation"
                        >
                          <Volume2 className="w-3 h-3" />
                        </button>
                      </div>
                      <cite className="text-indigo-600 text-xs block mt-2">
                        — {literary.author}, <em>{literary.work}</em>
                      </cite>
                    </div>
                    <p className="text-indigo-700 text-sm">{literary.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )
    }
  ];

  const handleSpeak = async (text: string) => {
    try {
      await speak(text);
    } catch (error) {
      console.error('Speech synthesis failed:', error);
      // Optionally show a user-friendly message
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
            Retour au tableau de bord
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
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            {sections[currentSection].icon}
            <h2 className="text-xl font-semibold text-gray-800">
              {sections[currentSection].title}
            </h2>
            <button
              onClick={() => handleSpeak(sections[currentSection].title)}
              className="p-1 text-gray-500 hover:text-blue-500 transition-colors"
              title="Écouter le titre de la section"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
          {sections[currentSection].content}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
            disabled={currentSection === 0}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              currentSection === 0
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
            Précédent
          </button>

          {currentSection === sections.length - 1 ? (
            <button
              onClick={onStartExercises}
              className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
            >
              Commencer les exercices
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={() => setCurrentSection(Math.min(sections.length - 1, currentSection + 1))}
              className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
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