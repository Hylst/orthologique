/**
 * Mobile interactions utilities for touch gestures and haptic feedback
 * Provides comprehensive mobile UX enhancements
 */

export interface TouchGestureOptions {
  threshold?: number;
  velocity?: number;
  preventScroll?: boolean;
}

export interface HapticFeedbackOptions {
  pattern?: number | number[];
  duration?: number;
  intensity?: 'light' | 'medium' | 'heavy';
}

/**
 * Touch gesture detection and handling
 */
export class TouchGestureHandler {
  private startX: number = 0;
  private startY: number = 0;
  private startTime: number = 0;
  private element: HTMLElement;
  private options: TouchGestureOptions;

  constructor(element: HTMLElement, options: TouchGestureOptions = {}) {
    this.element = element;
    this.options = {
      threshold: 50,
      velocity: 0.3,
      preventScroll: false,
      ...options
    };
    this.init();
  }

  private init() {
    this.element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: !this.options.preventScroll });
    this.element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: !this.options.preventScroll });
    this.element.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: !this.options.preventScroll });
  }

  private handleTouchStart(e: TouchEvent) {
    const touch = e.touches[0];
    this.startX = touch.clientX;
    this.startY = touch.clientY;
    this.startTime = Date.now();
  }

  private handleTouchMove(e: TouchEvent) {
    if (this.options.preventScroll) {
      e.preventDefault();
    }
  }

  private handleTouchEnd(e: TouchEvent) {
    const touch = e.changedTouches[0];
    const endX = touch.clientX;
    const endY = touch.clientY;
    const endTime = Date.now();

    const deltaX = endX - this.startX;
    const deltaY = endY - this.startY;
    const deltaTime = endTime - this.startTime;
    const velocity = Math.sqrt(deltaX * deltaX + deltaY * deltaY) / deltaTime;

    // Determine gesture type
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (Math.abs(deltaX) > this.options.threshold! && velocity > this.options.velocity!) {
        if (deltaX > 0) {
          this.onSwipeRight(deltaX, velocity);
        } else {
          this.onSwipeLeft(Math.abs(deltaX), velocity);
        }
      }
    } else {
      // Vertical swipe
      if (Math.abs(deltaY) > this.options.threshold! && velocity > this.options.velocity!) {
        if (deltaY > 0) {
          this.onSwipeDown(deltaY, velocity);
        } else {
          this.onSwipeUp(Math.abs(deltaY), velocity);
        }
      }
    }

    // Long press detection
    if (deltaTime > 500 && Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
      this.onLongPress(this.startX, this.startY);
    }
  }

  // Override these methods in subclasses or assign callbacks
  protected onSwipeLeft(_distance: number, _velocity: number) {}
  protected onSwipeRight(_distance: number, _velocity: number) {}
  protected onSwipeUp(_distance: number, _velocity: number) {}
  protected onSwipeDown(_distance: number, _velocity: number) {}
  protected onLongPress(_x: number, _y: number) {}

  // Public methods for external access
  public processTouchStart(e: TouchEvent) {
    this.handleTouchStart(e);
  }

  public processTouchMove(e: TouchEvent) {
    this.handleTouchMove(e);
  }

  public processTouchEnd(e: TouchEvent) {
    this.handleTouchEnd(e);
  }

  public destroy() {
    this.element.removeEventListener('touchstart', this.handleTouchStart.bind(this));
    this.element.removeEventListener('touchend', this.handleTouchEnd.bind(this));
    this.element.removeEventListener('touchmove', this.handleTouchMove.bind(this));
  }
}

/**
 * Haptic feedback utility for contextual vibrations
 */
export class HapticFeedback {
  private static isSupported(): boolean {
    return 'vibrate' in navigator;
  }

  /**
   * Success feedback - light, quick vibration
   */
  static success() {
    if (this.isSupported()) {
      navigator.vibrate(50);
    }
  }

  /**
   * Error feedback - double vibration pattern
   */
  static error() {
    if (this.isSupported()) {
      navigator.vibrate([100, 50, 100]);
    }
  }

  /**
   * Warning feedback - medium intensity
   */
  static warning() {
    if (this.isSupported()) {
      navigator.vibrate(150);
    }
  }

  /**
   * Navigation feedback - subtle tap
   */
  static navigation() {
    if (this.isSupported()) {
      navigator.vibrate(25);
    }
  }

  /**
   * Selection feedback - very light tap
   */
  static selection() {
    if (this.isSupported()) {
      navigator.vibrate(10);
    }
  }

  /**
   * Achievement feedback - celebration pattern
   */
  static achievement() {
    if (this.isSupported()) {
      navigator.vibrate([100, 50, 100, 50, 200]);
    }
  }

  /**
   * Custom vibration pattern
   */
  static custom(pattern: number | number[]) {
    if (this.isSupported()) {
      navigator.vibrate(pattern);
    }
  }
}

/**
 * Mobile viewport utilities
 */
export class MobileViewport {
  /**
   * Check if device is in portrait mode
   */
  static isPortrait(): boolean {
    return window.innerHeight > window.innerWidth;
  }

  /**
   * Check if device is in landscape mode
   */
  static isLandscape(): boolean {
    return window.innerWidth > window.innerHeight;
  }

  /**
   * Get safe area insets for devices with notches
   */
  static getSafeAreaInsets() {
    const style = getComputedStyle(document.documentElement);
    return {
      top: parseInt(style.getPropertyValue('env(safe-area-inset-top)') || '0'),
      right: parseInt(style.getPropertyValue('env(safe-area-inset-right)') || '0'),
      bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
      left: parseInt(style.getPropertyValue('env(safe-area-inset-left)') || '0')
    };
  }

  /**
   * Check if device supports touch
   */
  static isTouchDevice(): boolean {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  /**
   * Get device pixel ratio for high-DPI displays
   */
  static getPixelRatio(): number {
    return window.devicePixelRatio || 1;
  }

  /**
   * Check if device is mobile based on screen size and touch support
   */
  static isMobile(): boolean {
    return this.isTouchDevice() && window.innerWidth <= 768;
  }

  /**
   * Check if device is tablet
   */
  static isTablet(): boolean {
    return this.isTouchDevice() && window.innerWidth > 768 && window.innerWidth <= 1024;
  }
}

/**
 * One-hand mode utilities
 */
export class OneHandMode {
  private static isEnabled: boolean = false;
  private static callbacks: Array<(enabled: boolean) => void> = [];

  /**
   * Enable one-hand mode
   */
  static enable() {
    this.isEnabled = true;
    document.body.classList.add('one-hand-mode');
    this.notifyCallbacks();
    HapticFeedback.selection();
  }

  /**
   * Disable one-hand mode
   */
  static disable() {
    this.isEnabled = false;
    document.body.classList.remove('one-hand-mode');
    this.notifyCallbacks();
    HapticFeedback.selection();
  }

  /**
   * Toggle one-hand mode
   */
  static toggle() {
    if (this.isEnabled) {
      this.disable();
    } else {
      this.enable();
    }
  }

  /**
   * Check if one-hand mode is enabled
   */
  static isActive(): boolean {
    return this.isEnabled;
  }

  /**
   * Subscribe to one-hand mode changes
   */
  static subscribe(callback: (enabled: boolean) => void) {
    this.callbacks.push(callback);
    return () => {
      this.callbacks = this.callbacks.filter(cb => cb !== callback);
    };
  }

  private static notifyCallbacks() {
    this.callbacks.forEach(callback => callback(this.isEnabled));
  }
}

/**
 * Touch-friendly button utilities
 */
export const TouchButton = {
  /**
   * Get minimum touch target size (44px recommended by Apple/Google)
   */
  getMinTouchSize: () => 44,

  /**
   * Apply touch-friendly styles to an element
   */
  applyTouchStyles: (element: HTMLElement) => {
    element.style.minHeight = '44px';
    element.style.minWidth = '44px';
    element.style.padding = '12px';
    element.style.margin = '4px';
    element.style.borderRadius = '8px';
    element.style.cursor = 'pointer';
    element.style.userSelect = 'none';
    (element.style as any).webkitTapHighlightColor = 'transparent';
  },

  /**
   * Add touch feedback to button
   */
  addTouchFeedback: (element: HTMLElement) => {
    element.addEventListener('touchstart', () => {
      element.style.transform = 'scale(0.95)';
      element.style.opacity = '0.8';
      HapticFeedback.selection();
    });

    element.addEventListener('touchend', () => {
      element.style.transform = 'scale(1)';
      element.style.opacity = '1';
    });

    element.addEventListener('touchcancel', () => {
      element.style.transform = 'scale(1)';
      element.style.opacity = '1';
    });
  }
};

/**
 * Performance optimization for mobile
 */
export const MobilePerformance = {
  /**
   * Throttle function calls for better performance
   */
  throttle: <T extends (...args: any[]) => any>(func: T, delay: number): T => {
    let timeoutId: number;
    let lastExecTime = 0;
    return ((...args: any[]) => {
      const currentTime = Date.now();
      if (currentTime - lastExecTime > delay) {
        func(...args);
        lastExecTime = currentTime;
      } else {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
      }
    }) as T;
  },

  /**
   * Debounce function calls
   */
  debounce: <T extends (...args: any[]) => any>(func: T, delay: number): T => {
    let timeoutId: number;
    return ((...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    }) as T;
  },

  /**
   * Cross-browser requestAnimationFrame
   */
  requestAnimationFrame: (callback: FrameRequestCallback): number => {
    return (window.requestAnimationFrame || 
           (window as any).webkitRequestAnimationFrame || 
           ((cb: FrameRequestCallback) => window.setTimeout(cb, 16)))(callback);
  }
};