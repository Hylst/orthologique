/**
 * Accessibility utilities for ARIA attributes and screen reader support
 * Provides comprehensive accessibility enhancements for the application
 */

export interface AriaAttributes {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-hidden'?: boolean;
  'aria-live'?: 'off' | 'polite' | 'assertive';
  'aria-atomic'?: boolean;
  'aria-busy'?: boolean;
  'aria-current'?: 'page' | 'step' | 'location' | 'date' | 'time' | 'true' | 'false';
  'aria-disabled'?: boolean;
  'aria-invalid'?: boolean | 'grammar' | 'spelling';
  'aria-required'?: boolean;
  'aria-selected'?: boolean;
  'aria-pressed'?: boolean;
  'aria-checked'?: boolean | 'mixed';
  'aria-valuemin'?: number;
  'aria-valuemax'?: number;
  'aria-valuenow'?: number;
  'aria-valuetext'?: string;
  role?: string;
  tabIndex?: number;
}

/**
 * Generate ARIA attributes for interactive buttons
 * @param label - Accessible label for the button
 * @param pressed - Whether the button is pressed (for toggle buttons)
 * @param disabled - Whether the button is disabled
 * @returns ARIA attributes object
 */
export const getButtonAriaAttributes = (
  label: string,
  pressed?: boolean,
  disabled?: boolean
): AriaAttributes => {
  const attributes: AriaAttributes = {
    'aria-label': label,
    role: 'button',
    tabIndex: disabled ? -1 : 0
  };

  if (pressed !== undefined) {
    attributes['aria-pressed'] = pressed;
  }

  if (disabled) {
    attributes['aria-disabled'] = true;
  }

  return attributes;
};

/**
 * Generate ARIA attributes for form inputs
 * @param label - Input label
 * @param required - Whether the input is required
 * @param invalid - Whether the input has validation errors
 * @param describedBy - ID of element describing the input
 * @returns ARIA attributes object
 */
export const getInputAriaAttributes = (
  label: string,
  required?: boolean,
  invalid?: boolean,
  describedBy?: string
): AriaAttributes => {
  const attributes: AriaAttributes = {
    'aria-label': label
  };

  if (required) {
    attributes['aria-required'] = true;
  }

  if (invalid) {
    attributes['aria-invalid'] = true;
  }

  if (describedBy) {
    attributes['aria-describedby'] = describedBy;
  }

  return attributes;
};

/**
 * Generate ARIA attributes for progress indicators
 * @param current - Current progress value
 * @param max - Maximum progress value
 * @param label - Progress label
 * @returns ARIA attributes object
 */
export const getProgressAriaAttributes = (
  current: number,
  max: number,
  label: string
): AriaAttributes => {
  return {
    role: 'progressbar',
    'aria-valuenow': current,
    'aria-valuemin': 0,
    'aria-valuemax': max,
    'aria-valuetext': `${Math.round((current / max) * 100)}% - ${label}`,
    'aria-label': label
  };
};

/**
 * Generate ARIA attributes for navigation elements
 * @param label - Navigation label
 * @param current - Current page/step indicator
 * @returns ARIA attributes object
 */
export const getNavigationAriaAttributes = (
  label: string,
  current?: boolean
): AriaAttributes => {
  const attributes: AriaAttributes = {
    role: 'navigation',
    'aria-label': label
  };

  if (current) {
    attributes['aria-current'] = 'page';
  }

  return attributes;
};

/**
 * Generate ARIA attributes for live regions (announcements)
 * @param politeness - Level of politeness for screen reader announcements
 * @param atomic - Whether to read the entire region when it changes
 * @returns ARIA attributes object
 */
export const getLiveRegionAriaAttributes = (
  politeness: 'off' | 'polite' | 'assertive' = 'polite',
  atomic: boolean = false
): AriaAttributes => {
  return {
    'aria-live': politeness,
    'aria-atomic': atomic,
    role: 'status'
  };
};

/**
 * Generate ARIA attributes for modal dialogs
 * @param label - Modal title/label
 * @param describedBy - ID of element describing the modal
 * @returns ARIA attributes object
 */
export const getModalAriaAttributes = (
  label: string,
  describedBy?: string
): AriaAttributes => {
  const attributes: AriaAttributes = {
    role: 'dialog',
    'aria-modal': true,
    'aria-label': label,
    tabIndex: -1
  } as AriaAttributes & { 'aria-modal': boolean };

  if (describedBy) {
    attributes['aria-describedby'] = describedBy;
  }

  return attributes;
};

/**
 * Generate ARIA attributes for exercise options (multiple choice)
 * @param label - Option label
 * @param selected - Whether the option is selected
 * @param correct - Whether the option is correct (for feedback)
 * @returns ARIA attributes object
 */
export const getExerciseOptionAriaAttributes = (
  label: string,
  selected?: boolean,
  correct?: boolean
): AriaAttributes => {
  const attributes: AriaAttributes = {
    role: 'option',
    'aria-label': label,
    tabIndex: 0
  };

  if (selected !== undefined) {
    attributes['aria-selected'] = selected;
  }

  if (correct !== undefined && selected) {
    attributes['aria-describedby'] = correct ? 'correct-feedback' : 'incorrect-feedback';
  }

  return attributes;
};

/**
 * Generate ARIA attributes for lesson cards
 * @param title - Lesson title
 * @param completed - Whether the lesson is completed
 * @param locked - Whether the lesson is locked
 * @param difficulty - Lesson difficulty level
 * @returns ARIA attributes object
 */
export const getLessonCardAriaAttributes = (
  title: string,
  completed?: boolean,
  locked?: boolean,
  difficulty?: string
): AriaAttributes => {
  let label = `Leçon: ${title}`;
  
  if (difficulty) {
    label += `, niveau ${difficulty}`;
  }
  
  if (completed) {
    label += ', terminée';
  } else if (locked) {
    label += ', verrouillée';
  } else {
    label += ', disponible';
  }

  const attributes: AriaAttributes = {
    role: 'button',
    'aria-label': label,
    tabIndex: locked ? -1 : 0
  };

  if (locked) {
    attributes['aria-disabled'] = true;
  }

  return attributes;
};

/**
 * Generate ARIA attributes for audio controls (text-to-speech)
 * @param text - Text that will be spoken
 * @param isPlaying - Whether audio is currently playing
 * @returns ARIA attributes object
 */
export const getAudioControlAriaAttributes = (
  text: string,
  isPlaying?: boolean
): AriaAttributes => {
  const action = isPlaying ? 'Arrêter' : 'Écouter';
  const label = `${action} le texte: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`;

  return {
    'aria-label': label,
    'aria-pressed': isPlaying || false,
    role: 'button',
    tabIndex: 0
  };
};

/**
 * Generate ARIA attributes for drag and drop exercises
 * @param item - Item being dragged
 * @param dropZone - Whether this is a drop zone
 * @param active - Whether drag/drop is active
 * @returns ARIA attributes object
 */
export const getDragDropAriaAttributes = (
  item: string,
  dropZone?: boolean,
  active?: boolean
): AriaAttributes => {
  if (dropZone) {
    return {
      role: 'region',
      'aria-label': `Zone de dépôt${active ? ' active' : ''}`,
      'aria-dropeffect': active ? 'move' : 'none',
      tabIndex: 0
    } as AriaAttributes & { 'aria-dropeffect': string };
  }

  return {
    role: 'button',
    'aria-label': `Élément déplaçable: ${item}`,
    'aria-grabbed': active || false,
    draggable: true,
    tabIndex: 0
  } as AriaAttributes & { 'aria-grabbed': boolean; draggable: boolean };
};

/**
 * Generate ARIA attributes for score displays
 * @param score - Current score
 * @param maxScore - Maximum possible score
 * @param label - Score context label
 * @returns ARIA attributes object
 */
export const getScoreAriaAttributes = (
  score: number,
  maxScore: number,
  label: string = 'Score'
): AriaAttributes => {
  const percentage = Math.round((score / maxScore) * 100);
  
  return {
    role: 'status',
    'aria-label': `${label}: ${score} sur ${maxScore}, soit ${percentage}%`,
    'aria-live': 'polite'
  };
};

/**
 * Generate comprehensive ARIA attributes for complex components
 * @param componentType - Type of component
 * @param props - Component-specific properties
 * @returns ARIA attributes object
 */
export const getComponentAriaAttributes = (
  componentType: 'lesson-card' | 'exercise-option' | 'audio-control' | 'progress-bar' | 'modal' | 'navigation',
  props: Record<string, any>
): AriaAttributes => {
  switch (componentType) {
    case 'lesson-card':
      return getLessonCardAriaAttributes(
        props.title,
        props.completed,
        props.locked,
        props.difficulty
      );
    
    case 'exercise-option':
      return getExerciseOptionAriaAttributes(
        props.label,
        props.selected,
        props.correct
      );
    
    case 'audio-control':
      return getAudioControlAriaAttributes(
        props.text,
        props.isPlaying
      );
    
    case 'progress-bar':
      return getProgressAriaAttributes(
        props.current,
        props.max,
        props.label
      );
    
    case 'modal':
      return getModalAriaAttributes(
        props.label,
        props.describedBy
      );
    
    case 'navigation':
      return getNavigationAriaAttributes(
        props.label,
        props.current
      );
    
    default:
      return {};
  }
};

/**
 * Keyboard navigation helper
 * @param event - Keyboard event
 * @param callback - Function to call on Enter or Space
 */
export const handleKeyboardActivation = (
  event: React.KeyboardEvent,
  callback: () => void
): void => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    callback();
  }
};

/**
 * Focus management utilities
 */
export const focusManagement = {
  /**
   * Set focus to element by ID
   * @param elementId - ID of element to focus
   */
  focusElement: (elementId: string): void => {
    const element = document.getElementById(elementId);
    if (element) {
      element.focus();
    }
  },

  /**
   * Trap focus within a container (for modals)
   * @param container - Container element
   * @param event - Keyboard event
   */
  trapFocus: (container: HTMLElement, event: KeyboardEvent): void => {
    if (event.key !== 'Tab') return;

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }
};