/**
 * AccessibilityProvider Component
 * Provides WCAG 2.1 AA compliance features throughout the application
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  announceToScreenReader,
  manageFocus,
  keyboardNavigation,
  ariaHelpers,
  screenReaderUtils,
  initializeAccessibility
} from '../utils/wcagCompliance';

interface AccessibilityContextType {
  // Screen reader announcements
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
  announcePageChange: (pageName: string) => void;
  
  // Focus management
  setFocus: (element: HTMLElement, announceLabel?: string) => void;
  createFocusTrap: (container: HTMLElement) => (() => void);
  
  // Keyboard navigation
  handleArrowKeys: (e: KeyboardEvent, items: HTMLElement[], currentIndex: number) => number;
  handleActivation: (e: KeyboardEvent, callback: () => void) => void;
  
  // Visual preferences
  prefersReducedMotion: boolean;
  prefersHighContrast: boolean;
  
  // ARIA helpers
  setInteractiveAttributes: (element: HTMLElement, options: any) => void;
  createProgressIndicator: (current: number, total: number, label: string) => string;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

interface AccessibilityProviderProps {
  children: ReactNode;
}

/**
 * AccessibilityProvider component that wraps the application with WCAG compliance features
 */
export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [prefersHighContrast, setPrefersHighContrast] = useState(false);

  useEffect(() => {
    // Initialize accessibility features
    initializeAccessibility();
    
    // Set up media query listeners for user preferences
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
    
    const updateReducedMotion = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    const updateHighContrast = (e: MediaQueryListEvent) => setPrefersHighContrast(e.matches);
    
    // Set initial values
    setPrefersReducedMotion(reducedMotionQuery.matches);
    setPrefersHighContrast(highContrastQuery.matches);
    
    // Add listeners
    reducedMotionQuery.addEventListener('change', updateReducedMotion);
    highContrastQuery.addEventListener('change', updateHighContrast);
    
    // Apply accessibility classes to body
    document.body.classList.toggle('reduce-motion', reducedMotionQuery.matches);
    document.body.classList.toggle('high-contrast', highContrastQuery.matches);
    
    // Cleanup
    return () => {
      reducedMotionQuery.removeEventListener('change', updateReducedMotion);
      highContrastQuery.removeEventListener('change', updateHighContrast);
    };
  }, []);

  const contextValue: AccessibilityContextType = {
    // Screen reader announcements
    announce: announceToScreenReader,
    announcePageChange: screenReaderUtils.announcePageChange,
    
    // Focus management
    setFocus: manageFocus.setFocus,
    createFocusTrap: manageFocus.createFocusTrap,
    
    // Keyboard navigation
    handleArrowKeys: keyboardNavigation.handleArrowKeys,
    handleActivation: keyboardNavigation.handleActivation,
    
    // Visual preferences
    prefersReducedMotion,
    prefersHighContrast,
    
    // ARIA helpers
    setInteractiveAttributes: ariaHelpers.setInteractiveAttributes,
    createProgressIndicator: ariaHelpers.createProgressIndicator
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      <div 
        id="main-content" 
        role="main"
        className={`
          ${prefersReducedMotion ? 'reduce-motion' : ''}
          ${prefersHighContrast ? 'high-contrast' : ''}
        `}
      >
        {children}
      </div>
    </AccessibilityContext.Provider>
  );
};

/**
 * Hook to use accessibility features throughout the application
 */
export const useAccessibility = (): AccessibilityContextType => {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

/**
 * Higher-order component to add accessibility features to any component
 */
export const withAccessibility = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  return (props: P) => {
    const accessibility = useAccessibility();
    return <Component {...props} accessibility={accessibility} />;
  };
};

export default AccessibilityProvider;