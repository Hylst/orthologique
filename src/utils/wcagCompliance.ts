/**
 * WCAG 2.1 AA Compliance Utilities
 * Provides accessibility features for screen readers, keyboard navigation, and inclusive design
 */

// ARIA live region announcements for screen readers
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite'): void => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

// Enhanced focus management for keyboard navigation
export const manageFocus = {
  /**
   * Set focus to element with proper ARIA attributes
   */
  setFocus: (element: HTMLElement, announceLabel?: string): void => {
    element.focus();
    if (announceLabel) {
      announceToScreenReader(announceLabel);
    }
  },

  /**
   * Create focus trap for modals and overlays
   */
  createFocusTrap: (container: HTMLElement): (() => void) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
      
      // Escape key to close modal
      if (e.key === 'Escape') {
        const closeButton = container.querySelector('[aria-label*="close"], [aria-label*="fermer"]') as HTMLElement;
        if (closeButton) {
          closeButton.click();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }
};

// Keyboard navigation helpers
export const keyboardNavigation = {
  /**
   * Handle arrow key navigation for lists and grids
   */
  handleArrowKeys: (e: KeyboardEvent, items: HTMLElement[], currentIndex: number): number => {
    let newIndex = currentIndex;
    
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        newIndex = (currentIndex + 1) % items.length;
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        newIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
        break;
      case 'Home':
        newIndex = 0;
        break;
      case 'End':
        newIndex = items.length - 1;
        break;
      default:
        return currentIndex;
    }
    
    e.preventDefault();
    items[newIndex]?.focus();
    return newIndex;
  },

  /**
   * Handle Enter and Space key activation
   */
  handleActivation: (e: KeyboardEvent, callback: () => void): void => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      callback();
    }
  }
};

// Color contrast and visual accessibility
export const visualAccessibility = {
  /**
   * Check if user prefers reduced motion
   */
  prefersReducedMotion: (): boolean => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  /**
   * Check if user prefers high contrast
   */
  prefersHighContrast: (): boolean => {
    return window.matchMedia('(prefers-contrast: high)').matches;
  },

  /**
   * Apply accessibility-friendly animations
   */
  applyAccessibleAnimation: (element: HTMLElement, animationClass: string): void => {
    if (!visualAccessibility.prefersReducedMotion()) {
      element.classList.add(animationClass);
    }
  }
};

// ARIA attributes helpers
export const ariaHelpers = {
  /**
   * Set comprehensive ARIA attributes for interactive elements
   */
  setInteractiveAttributes: (element: HTMLElement, options: {
    label: string;
    description?: string;
    expanded?: boolean;
    pressed?: boolean;
    selected?: boolean;
    disabled?: boolean;
  }): void => {
    element.setAttribute('aria-label', options.label);
    
    if (options.description) {
      const descId = `desc-${Math.random().toString(36).substr(2, 9)}`;
      const descElement = document.createElement('span');
      descElement.id = descId;
      descElement.className = 'sr-only';
      descElement.textContent = options.description;
      element.appendChild(descElement);
      element.setAttribute('aria-describedby', descId);
    }
    
    if (options.expanded !== undefined) {
      element.setAttribute('aria-expanded', options.expanded.toString());
    }
    
    if (options.pressed !== undefined) {
      element.setAttribute('aria-pressed', options.pressed.toString());
    }
    
    if (options.selected !== undefined) {
      element.setAttribute('aria-selected', options.selected.toString());
    }
    
    if (options.disabled) {
      element.setAttribute('aria-disabled', 'true');
      element.setAttribute('tabindex', '-1');
    }
  },

  /**
   * Create accessible progress indicator
   */
  createProgressIndicator: (current: number, total: number, label: string): string => {
    const percentage = Math.round((current / total) * 100);
    return `${label}: ${current} sur ${total}, ${percentage}% terminé`;
  }
};

// Screen reader specific utilities
export const screenReaderUtils = {
  /**
   * Create skip links for main content navigation
   */
  createSkipLinks: (): void => {
    const skipLinks = document.createElement('div');
    skipLinks.className = 'skip-links';
    skipLinks.innerHTML = `
      <a href="#main-content" class="skip-link">Aller au contenu principal</a>
      <a href="#navigation" class="skip-link">Aller à la navigation</a>
    `;
    
    document.body.insertBefore(skipLinks, document.body.firstChild);
  },

  /**
   * Announce page changes for SPA navigation
   */
  announcePageChange: (pageName: string): void => {
    announceToScreenReader(`Navigation vers ${pageName}`, 'assertive');
    
    // Update document title
    document.title = `${pageName} - Orthologique`;
  },

  /**
   * Announce dynamic content changes
   */
  announceContentChange: (message: string, isImportant = false): void => {
    announceToScreenReader(message, isImportant ? 'assertive' : 'polite');
  }
};

// Form accessibility helpers
export const formAccessibility = {
  /**
   * Associate labels with form controls
   */
  associateLabel: (input: HTMLInputElement, labelText: string): void => {
    const labelId = `label-${Math.random().toString(36).substr(2, 9)}`;
    const label = document.createElement('label');
    label.id = labelId;
    label.textContent = labelText;
    label.setAttribute('for', input.id || (input.id = `input-${Math.random().toString(36).substr(2, 9)}`));
    
    input.parentNode?.insertBefore(label, input);
  },

  /**
   * Add error messaging with ARIA attributes
   */
  addErrorMessage: (input: HTMLInputElement, errorMessage: string): void => {
    const errorId = `error-${Math.random().toString(36).substr(2, 9)}`;
    const errorElement = document.createElement('div');
    errorElement.id = errorId;
    errorElement.className = 'error-message';
    errorElement.setAttribute('role', 'alert');
    errorElement.textContent = errorMessage;
    
    input.setAttribute('aria-describedby', errorId);
    input.setAttribute('aria-invalid', 'true');
    input.parentNode?.appendChild(errorElement);
    
    announceToScreenReader(`Erreur: ${errorMessage}`, 'assertive');
  }
};

// Initialize accessibility features
export const initializeAccessibility = (): void => {
  // Create skip links
  screenReaderUtils.createSkipLinks();
  
  // Add global keyboard event listeners
  document.addEventListener('keydown', (e) => {
    // Global escape key handler
    if (e.key === 'Escape') {
      const activeModal = document.querySelector('[role="dialog"][aria-hidden="false"]');
      if (activeModal) {
        const closeButton = activeModal.querySelector('[aria-label*="close"], [aria-label*="fermer"]') as HTMLElement;
        closeButton?.click();
      }
    }
  });
  
  // Announce when page is ready
  document.addEventListener('DOMContentLoaded', () => {
    announceToScreenReader('Application Orthologique chargée et prête à utiliser');
  });
};