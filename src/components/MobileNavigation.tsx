import React, { useState, useEffect } from 'react';
import { Home, BookOpen, BarChart3, User, Settings, ChevronUp } from 'lucide-react';
import { OneHandMode, HapticFeedback, MobileViewport } from '../utils/mobileInteractions';

/**
 * Mobile bottom navigation component
 * Optimized for one-hand usage with thumb-friendly positioning
 */
interface MobileNavigationProps {
  currentView: 'dashboard' | 'lesson' | 'exercise' | 'results' | 'profile' | 'settings';
  onNavigate: (view: string) => void;
  className?: string;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  ariaLabel: string;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  currentView,
  onNavigate,
  className = ''
}) => {
  const [isOneHandMode, setIsOneHandMode] = useState(OneHandMode.isActive());
  const [isMobile, setIsMobile] = useState(MobileViewport.isMobile());
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Accueil',
      icon: Home,
      ariaLabel: 'Aller au tableau de bord'
    },
    {
      id: 'lesson',
      label: 'Leçons',
      icon: BookOpen,
      ariaLabel: 'Accéder aux leçons'
    },
    {
      id: 'stats',
      label: 'Stats',
      icon: BarChart3,
      ariaLabel: 'Voir les statistiques'
    },
    {
      id: 'profile',
      label: 'Profil',
      icon: User,
      ariaLabel: 'Gérer le profil'
    },
    {
      id: 'settings',
      label: 'Réglages',
      icon: Settings,
      ariaLabel: 'Ouvrir les paramètres'
    }
  ];

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

  const handleNavigation = (itemId: string) => {
    HapticFeedback.navigation();
    onNavigate(itemId);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    HapticFeedback.selection();
  };

  // Only show on mobile devices
  if (!isMobile) {
    return null;
  }

  return (
    <>
      {/* Safe area spacer for devices with home indicator */}
      <div className="h-safe-area-inset-bottom" />
      
      {/* Navigation container */}
      <nav 
        className={`
          fixed bottom-0 left-0 right-0 z-50
          bg-white border-t border-gray-200 shadow-lg
          transition-transform duration-300 ease-in-out
          ${isOneHandMode ? 'transform-none' : ''}
          ${isCollapsed ? 'translate-y-full' : 'translate-y-0'}
          ${className}
        `}
        style={{
          paddingBottom: 'env(safe-area-inset-bottom)',
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)'
        }}
        role="navigation"
        aria-label="Navigation mobile principale"
      >
        {/* Collapse toggle for one-hand mode */}
        {isOneHandMode && (
          <button
            onClick={toggleCollapse}
            className="
              absolute -top-8 right-4 w-8 h-8 
              bg-white border border-gray-200 rounded-t-lg
              flex items-center justify-center
              shadow-sm active:scale-95 transition-transform
            "
            aria-label={isCollapsed ? 'Afficher la navigation' : 'Masquer la navigation'}
          >
            <ChevronUp 
              className={`w-4 h-4 text-gray-600 transition-transform ${
                isCollapsed ? 'rotate-180' : ''
              }`} 
            />
          </button>
        )}

        {/* Navigation items */}
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={`
                  flex flex-col items-center justify-center
                  min-w-[44px] min-h-[44px] px-2 py-1
                  rounded-lg transition-all duration-200
                  active:scale-95 touch-manipulation
                  ${
                    isActive
                      ? 'bg-blue-100 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }
                `}
                aria-label={item.ariaLabel}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium leading-none">
                  {item.label}
                </span>
                
                {/* Active indicator */}
                {isActive && (
                  <div className="w-1 h-1 bg-blue-600 rounded-full mt-1" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default MobileNavigation;