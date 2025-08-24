import React from 'react';
import { Lightbulb } from 'lucide-react';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 'medium', showText = true }) => {
  const sizeClasses = {
    small: 'w-8 h-8 text-lg',
    medium: 'w-12 h-12 text-xl',
    large: 'w-16 h-16 text-2xl',
  };

  return (
    <div className="flex items-center gap-3">
      <div className={`${sizeClasses[size]} bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg`}>
        <Lightbulb className="w-1/2 h-1/2 text-white" />
      </div>
      {showText && (
        <div className="flex flex-col">
          <h1 className={`font-bold text-gray-800 ${size === 'large' ? 'text-3xl' : size === 'medium' ? 'text-xl' : 'text-lg'}`}>
            OrthoLogique
          </h1>
          <p className={`text-gray-600 ${size === 'large' ? 'text-sm' : 'text-xs'}`}>
            Maîtrisez l'orthographe par la logique
          </p>
        </div>
      )}
    </div>
  );
};

export default Logo;