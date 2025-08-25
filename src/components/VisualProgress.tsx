import React from 'react';
import { UserProgress } from '../types';

interface VisualProgressProps {
  userProgress: UserProgress;
  type: 'tree' | 'cat';
  className?: string;
}

/**
 * Visual progress component that displays either a growing tree or a cat with changing moods
 * based on user's exercise completion success rate
 */
const VisualProgress: React.FC<VisualProgressProps> = ({ userProgress, type, className = '' }) => {
  
  /**
   * Calculate progress stage (0-5) based on success rate
   * Stage 0: 0-16% success rate (worst)
   * Stage 1: 17-33% success rate
   * Stage 2: 34-50% success rate
   * Stage 3: 51-66% success rate
   * Stage 4: 67-83% success rate
   * Stage 5: 84-100% success rate (best)
   */
  const calculateProgressStage = (): number => {
    const totalExercises = Object.keys(userProgress.scores).length;
    if (totalExercises === 0) return 0;
    
    const successfulExercises = Object.values(userProgress.scores).filter(score => score >= 70).length;
    const successRate = (successfulExercises / totalExercises) * 100;
    
    if (successRate >= 84) return 5;
    if (successRate >= 67) return 4;
    if (successRate >= 51) return 3;
    if (successRate >= 34) return 2;
    if (successRate >= 17) return 1;
    return 0;
  };

  const currentStage = calculateProgressStage();

  /**
   * Tree SVG components for each growth stage
   */
  const TreeStages = {
    0: () => (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {/* Empty ground - no tree yet */}
        <rect x="0" y="180" width="200" height="20" fill="#8B4513" />
        <text x="100" y="100" textAnchor="middle" fill="#666" fontSize="14">Commence ton aventure !</text>
      </svg>
    ),
    1: () => (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {/* Small seed/sprout */}
        <rect x="0" y="180" width="200" height="20" fill="#8B4513" />
        <circle cx="100" cy="175" r="3" fill="#654321" />
        <line x1="100" y1="175" x2="100" y2="165" stroke="#90EE90" strokeWidth="2" />
        <circle cx="98" cy="163" r="2" fill="#90EE90" />
        <circle cx="102" cy="163" r="2" fill="#90EE90" />
      </svg>
    ),
    2: () => (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {/* Small sapling */}
        <rect x="0" y="180" width="200" height="20" fill="#8B4513" />
        <line x1="100" y1="180" x2="100" y2="140" stroke="#8B4513" strokeWidth="4" />
        <circle cx="100" cy="135" r="8" fill="#90EE90" />
        <circle cx="95" cy="140" r="6" fill="#90EE90" />
        <circle cx="105" cy="140" r="6" fill="#90EE90" />
      </svg>
    ),
    3: () => (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {/* Young tree */}
        <rect x="0" y="180" width="200" height="20" fill="#8B4513" />
        <line x1="100" y1="180" x2="100" y2="120" stroke="#8B4513" strokeWidth="6" />
        <circle cx="100" cy="110" r="15" fill="#228B22" />
        <circle cx="85" cy="120" r="12" fill="#228B22" />
        <circle cx="115" cy="120" r="12" fill="#228B22" />
        <circle cx="100" cy="130" r="10" fill="#228B22" />
      </svg>
    ),
    4: () => (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {/* Mature tree */}
        <rect x="0" y="180" width="200" height="20" fill="#8B4513" />
        <line x1="100" y1="180" x2="100" y2="100" stroke="#8B4513" strokeWidth="8" />
        <line x1="100" y1="120" x2="80" y2="110" stroke="#8B4513" strokeWidth="4" />
        <line x1="100" y1="120" x2="120" y2="110" stroke="#8B4513" strokeWidth="4" />
        <circle cx="100" cy="90" r="20" fill="#228B22" />
        <circle cx="75" cy="105" r="15" fill="#228B22" />
        <circle cx="125" cy="105" r="15" fill="#228B22" />
        <circle cx="85" cy="125" r="12" fill="#228B22" />
        <circle cx="115" cy="125" r="12" fill="#228B22" />
      </svg>
    ),
    5: () => (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {/* Magnificent tree with flowers */}
        <rect x="0" y="180" width="200" height="20" fill="#8B4513" />
        <line x1="100" y1="180" x2="100" y2="80" stroke="#8B4513" strokeWidth="10" />
        <line x1="100" y1="100" x2="70" y2="90" stroke="#8B4513" strokeWidth="5" />
        <line x1="100" y1="100" x2="130" y2="90" stroke="#8B4513" strokeWidth="5" />
        <line x1="100" y1="120" x2="75" y2="115" stroke="#8B4513" strokeWidth="4" />
        <line x1="100" y1="120" x2="125" y2="115" stroke="#8B4513" strokeWidth="4" />
        <circle cx="100" cy="70" r="25" fill="#32CD32" />
        <circle cx="70" cy="85" r="18" fill="#32CD32" />
        <circle cx="130" cy="85" r="18" fill="#32CD32" />
        <circle cx="80" cy="110" r="15" fill="#32CD32" />
        <circle cx="120" cy="110" r="15" fill="#32CD32" />
        <circle cx="90" cy="130" r="12" fill="#32CD32" />
        <circle cx="110" cy="130" r="12" fill="#32CD32" />
        {/* Flowers */}
        <circle cx="95" cy="65" r="3" fill="#FFB6C1" />
        <circle cx="105" cy="70" r="3" fill="#FFB6C1" />
        <circle cx="75" cy="80" r="3" fill="#FFB6C1" />
        <circle cx="125" cy="90" r="3" fill="#FFB6C1" />
        {/* Sparkles */}
        <text x="60" y="60" fill="#FFD700" fontSize="16">✨</text>
        <text x="140" y="70" fill="#FFD700" fontSize="16">✨</text>
        <text x="110" y="50" fill="#FFD700" fontSize="16">✨</text>
      </svg>
    )
  };

  /**
   * Cat SVG components for each mood stage
   */
  const CatStages = {
    0: () => (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {/* Very sad cat lying down */}
        <ellipse cx="100" cy="150" rx="40" ry="15" fill="#FFA500" />
        <circle cx="100" cy="130" r="25" fill="#FFA500" />
        {/* Ears */}
        <polygon points="85,110 90,95 95,110" fill="#FFA500" />
        <polygon points="105,110 110,95 115,110" fill="#FFA500" />
        {/* Very sad eyes */}
        <path d="M 90 125 Q 85 130 90 135" stroke="#000" strokeWidth="2" fill="none" />
        <path d="M 110 125 Q 115 130 110 135" stroke="#000" strokeWidth="2" fill="none" />
        {/* Downturned mouth */}
        <path d="M 95 140 Q 100 145 105 140" stroke="#000" strokeWidth="2" fill="none" />
        <text x="100" y="180" textAnchor="middle" fill="#666" fontSize="12">Courage ! Tu peux y arriver</text>
      </svg>
    ),
    1: () => (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {/* Sad cat lying down */}
        <ellipse cx="100" cy="150" rx="40" ry="15" fill="#FFA500" />
        <circle cx="100" cy="130" r="25" fill="#FFA500" />
        {/* Ears */}
        <polygon points="85,110 90,95 95,110" fill="#FFA500" />
        <polygon points="105,110 110,95 115,110" fill="#FFA500" />
        {/* Sad eyes */}
        <circle cx="90" cy="125" r="3" fill="#000" />
        <circle cx="110" cy="125" r="3" fill="#000" />
        {/* Neutral mouth */}
        <line x1="95" y1="140" x2="105" y2="140" stroke="#000" strokeWidth="2" />
      </svg>
    ),
    2: () => (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {/* Cat sitting up, neutral */}
        <ellipse cx="100" cy="160" rx="20" ry="25" fill="#FFA500" />
        <circle cx="100" cy="120" r="25" fill="#FFA500" />
        {/* Ears */}
        <polygon points="85,100 90,85 95,100" fill="#FFA500" />
        <polygon points="105,100 110,85 115,100" fill="#FFA500" />
        {/* Eyes */}
        <circle cx="90" cy="115" r="3" fill="#000" />
        <circle cx="110" cy="115" r="3" fill="#000" />
        {/* Slight smile */}
        <path d="M 95 130 Q 100 135 105 130" stroke="#000" strokeWidth="2" fill="none" />
      </svg>
    ),
    3: () => (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {/* Cat sitting, happy */}
        <ellipse cx="100" cy="160" rx="20" ry="25" fill="#FFA500" />
        <circle cx="100" cy="120" r="25" fill="#FFA500" />
        {/* Ears */}
        <polygon points="85,100 90,85 95,100" fill="#FFA500" />
        <polygon points="105,100 110,85 115,100" fill="#FFA500" />
        {/* Happy eyes */}
        <path d="M 85 115 Q 90 110 95 115" stroke="#000" strokeWidth="2" fill="none" />
        <path d="M 105 115 Q 110 110 115 115" stroke="#000" strokeWidth="2" fill="none" />
        {/* Happy smile */}
        <path d="M 90 130 Q 100 140 110 130" stroke="#000" strokeWidth="2" fill="none" />
        {/* Tail up */}
        <path d="M 120 140 Q 130 120 125 100" stroke="#FFA500" strokeWidth="8" fill="none" />
      </svg>
    ),
    4: () => (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {/* Cat standing, very happy */}
        <ellipse cx="100" cy="150" rx="30" ry="20" fill="#FFA500" />
        <circle cx="100" cy="120" r="25" fill="#FFA500" />
        {/* Ears */}
        <polygon points="85,100 90,85 95,100" fill="#FFA500" />
        <polygon points="105,100 110,85 115,100" fill="#FFA500" />
        {/* Very happy eyes */}
        <path d="M 85 115 Q 90 105 95 115" stroke="#000" strokeWidth="2" fill="none" />
        <path d="M 105 115 Q 110 105 115 115" stroke="#000" strokeWidth="2" fill="none" />
        {/* Big smile */}
        <path d="M 85 130 Q 100 145 115 130" stroke="#000" strokeWidth="2" fill="none" />
        {/* Legs */}
        <line x1="85" y1="150" x2="85" y2="170" stroke="#FFA500" strokeWidth="6" />
        <line x1="95" y1="150" x2="95" y2="170" stroke="#FFA500" strokeWidth="6" />
        <line x1="105" y1="150" x2="105" y2="170" stroke="#FFA500" strokeWidth="6" />
        <line x1="115" y1="150" x2="115" y2="170" stroke="#FFA500" strokeWidth="6" />
        {/* Tail wagging */}
        <path d="M 130 130 Q 140 110 135 90" stroke="#FFA500" strokeWidth="8" fill="none" />
      </svg>
    ),
    5: () => (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {/* Cat jumping with joy */}
        <ellipse cx="100" cy="120" rx="30" ry="20" fill="#FFA500" />
        <circle cx="100" cy="90" r="25" fill="#FFA500" />
        {/* Ears */}
        <polygon points="85,70 90,55 95,70" fill="#FFA500" />
        <polygon points="105,70 110,55 115,70" fill="#FFA500" />
        {/* Ecstatic eyes */}
        <circle cx="90" cy="85" r="2" fill="#000" />
        <circle cx="110" cy="85" r="2" fill="#000" />
        <path d="M 85 80 Q 90 75 95 80" stroke="#000" strokeWidth="2" fill="none" />
        <path d="M 105 80 Q 110 75 115 80" stroke="#000" strokeWidth="2" fill="none" />
        {/* Huge smile */}
        <path d="M 80 100 Q 100 115 120 100" stroke="#000" strokeWidth="3" fill="none" />
        {/* Legs in jumping position */}
        <line x1="80" y1="120" x2="75" y2="140" stroke="#FFA500" strokeWidth="6" />
        <line x1="90" y1="120" x2="85" y2="140" stroke="#FFA500" strokeWidth="6" />
        <line x1="110" y1="120" x2="115" y2="140" stroke="#FFA500" strokeWidth="6" />
        <line x1="120" y1="120" x2="125" y2="140" stroke="#FFA500" strokeWidth="6" />
        {/* Tail high and curved */}
        <path d="M 130 100 Q 145 80 140 60" stroke="#FFA500" strokeWidth="8" fill="none" />
        {/* Hearts and sparkles */}
        <text x="60" y="50" fill="#FF69B4" fontSize="16">💖</text>
        <text x="140" y="60" fill="#FFD700" fontSize="16">✨</text>
        <text x="50" y="100" fill="#FFD700" fontSize="16">⭐</text>
        <text x="150" y="110" fill="#FF69B4" fontSize="16">💖</text>
        <text x="100" y="170" textAnchor="middle" fill="#32CD32" fontSize="14" fontWeight="bold">Fantastique ! 🎉</text>
      </svg>
    )
  };

  const stages = type === 'tree' ? TreeStages : CatStages;
  const CurrentStage = stages[currentStage as keyof typeof stages];

  return (
    <div className={`visual-progress ${className}`}>
      <div className="w-full h-64 flex items-center justify-center bg-gradient-to-b from-sky-200 to-green-100 rounded-lg shadow-lg transition-all duration-1000 ease-in-out">
        <div className="transform transition-all duration-1000 ease-in-out hover:scale-105">
          <CurrentStage />
        </div>
      </div>
      <div className="mt-4 text-center">
        <div className="text-sm text-gray-600 mb-2">
          {type === 'tree' ? '🌳 Arbre de la réussite' : '🐱 Compagnon de progression'}
        </div>
        <div className="flex justify-center space-x-1">
          {[0, 1, 2, 3, 4, 5].map((stage) => (
            <div
              key={stage}
              className={`w-3 h-3 rounded-full ${
                stage <= currentStage
                  ? type === 'tree'
                    ? 'bg-green-500'
                    : 'bg-orange-500'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Étape {currentStage + 1} / 6
        </div>
      </div>
    </div>
  );
};

export default VisualProgress;