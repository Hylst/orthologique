import React, { useState, useEffect } from 'react';
import { Hand, ChevronDown } from 'lucide-react';
import { OneHandMode, HapticFeedback, MobileViewport } from '../utils/mobileInteractions';

/**
 * One-hand mode toggle component
 * Provides easy access to one-hand mode for better mobile UX
 */
interface OneHandModeToggleProps {
  className?: string;
  showLabel?: boolean;
}

const OneHandModeToggle: React.FC<OneHandModeToggleProps> = ({ 
  className = '', 
  showLabel = true 
}) => {
  const [isOneHandMode, setIsOneHandMode] = useState(OneHandMode.isActive());
  const [isMobile, setIsMobile] = useState(MobileViewport.isMobile());

  useEffect(() => {
    // Subscribe to one-hand mode changes
    const unsubscribe = OneHandMode.subscribe(setIsOneHandMode);

    // Check if device is mobile
    const checkMobile = () => {
      setIsMobile(MobileViewport.isMobile());
    };

    window.addEventListener('resize', checkMobile);
    window.addEventListener('orientationchange', checkMobile);

    return () => {
      unsubscribe();
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('orientationchange', checkMobile);
    };
  }, []);

  const handleToggle = () => {
    OneHandMode.toggle();
    HapticFeedback.selection();
  };

  // Only show on mobile devices
  if (!isMobile) {
    return null;
  }

  return (
    <button
      onClick={handleToggle}
      className={`
        flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200
        ${isOneHandMode 
          ? 'bg-blue-100 text-blue-700 border-2 border-blue-300' 
          : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
        }
        active:scale-95 touch-manipulation
        ${className}
      `}
      aria-label={isOneHandMode ? 'Désactiver le mode une main' : 'Activer le mode une main'}
      aria-pressed={isOneHandMode}
    >
      <div className="relative">
        <Hand className="w-4 h-4" />
        {isOneHandMode && (
          <ChevronDown className="w-3 h-3 absolute -top-1 -right-1 text-blue-600" />
        )}
      </div>
      
      {showLabel && (
        <span className="text-sm font-medium">
          {isOneHandMode ? 'Mode 1 main' : 'Mode 1 main'}
        </span>
      )}
    </button>
  );
};

export default OneHandModeToggle;