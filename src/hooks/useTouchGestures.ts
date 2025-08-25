import { useEffect, useRef, useCallback } from 'react';
import { TouchGestureHandler, HapticFeedback } from '../utils/mobileInteractions';

/**
 * Custom hook for handling touch gestures
 * Provides easy integration of swipe, tap, and long press gestures
 */
interface UseTouchGesturesOptions {
  onSwipeLeft?: (distance: number, velocity: number) => void;
  onSwipeRight?: (distance: number, velocity: number) => void;
  onSwipeUp?: (distance: number, velocity: number) => void;
  onSwipeDown?: (distance: number, velocity: number) => void;
  onLongPress?: (x: number, y: number) => void;
  onTap?: (x: number, y: number) => void;
  threshold?: number;
  velocity?: number;
  preventScroll?: boolean;
  enableHapticFeedback?: boolean;
}

interface UseTouchGesturesReturn {
  ref: React.RefObject<HTMLElement>;
  isGestureActive: boolean;
  onTouchStart: (event: React.TouchEvent) => void;
  onTouchMove: (event: React.TouchEvent) => void;
  onTouchEnd: (event: React.TouchEvent) => void;
}

export const useTouchGestures = (options: UseTouchGesturesOptions = {}): UseTouchGesturesReturn => {
  const elementRef = useRef<HTMLElement>(null);
  const gestureHandlerRef = useRef<TouchGestureHandler | null>(null);
  const isGestureActiveRef = useRef(false);

  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onLongPress,
    onTap,
    threshold = 50,
    velocity = 0.3,
    preventScroll = false,
    enableHapticFeedback = true
  } = options;

  // Create custom gesture handler class
  const createGestureHandler = useCallback((element: HTMLElement) => {
    class CustomGestureHandler extends TouchGestureHandler {
      protected onSwipeLeft(distance: number, velocity: number) {
        if (enableHapticFeedback) HapticFeedback.navigation();
        onSwipeLeft?.(distance, velocity);
      }

      protected onSwipeRight(distance: number, velocity: number) {
        if (enableHapticFeedback) HapticFeedback.navigation();
        onSwipeRight?.(distance, velocity);
      }

      protected onSwipeUp(distance: number, velocity: number) {
        if (enableHapticFeedback) HapticFeedback.navigation();
        onSwipeUp?.(distance, velocity);
      }

      protected onSwipeDown(distance: number, velocity: number) {
        if (enableHapticFeedback) HapticFeedback.navigation();
        onSwipeDown?.(distance, velocity);
      }

      protected onLongPress(x: number, y: number) {
        if (enableHapticFeedback) HapticFeedback.selection();
        onLongPress?.(x, y);
      }
    }

    return new CustomGestureHandler(element, {
      threshold,
      velocity,
      preventScroll
    });
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onLongPress, threshold, velocity, preventScroll, enableHapticFeedback]);

  // Handle tap gesture separately
  const handleTap = useCallback((e: TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      if (enableHapticFeedback) HapticFeedback.selection();
      onTap?.(touch.clientX, touch.clientY);
    }
  }, [onTap, enableHapticFeedback]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Create gesture handler
    gestureHandlerRef.current = createGestureHandler(element);

    // Add tap handler if needed
    if (onTap) {
      element.addEventListener('touchstart', handleTap, { passive: true });
    }

    // Cleanup function
    return () => {
      if (gestureHandlerRef.current) {
        gestureHandlerRef.current.destroy();
        gestureHandlerRef.current = null;
      }
      if (onTap) {
        element.removeEventListener('touchstart', handleTap);
      }
    };
  }, [createGestureHandler, handleTap, onTap]);

  // Touch event handlers for direct use
  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    if (gestureHandlerRef.current) {
      gestureHandlerRef.current.processTouchStart(event.nativeEvent);
    }
  }, []);

  const handleTouchMove = useCallback((event: React.TouchEvent) => {
    if (gestureHandlerRef.current) {
      gestureHandlerRef.current.processTouchMove(event.nativeEvent);
    }
  }, []);

  const handleTouchEnd = useCallback((event: React.TouchEvent) => {
    if (gestureHandlerRef.current) {
      gestureHandlerRef.current.processTouchEnd(event.nativeEvent);
    }
  }, []);

  return {
    ref: elementRef,
    isGestureActive: isGestureActiveRef.current,
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd
  };
};

/**
 * Hook for swipe navigation (common pattern)
 */
interface UseSwipeNavigationOptions {
  onNext?: () => void;
  onPrevious?: () => void;
  onUp?: () => void;
  onDown?: () => void;
  threshold?: number;
  enableHapticFeedback?: boolean;
}

export const useSwipeNavigation = (options: UseSwipeNavigationOptions = {}) => {
  const {
    onNext,
    onPrevious,
    onUp,
    onDown,
    threshold = 50,
    enableHapticFeedback = true
  } = options;

  return useTouchGestures({
    onSwipeLeft: onNext ? () => onNext() : undefined,
    onSwipeRight: onPrevious ? () => onPrevious() : undefined,
    onSwipeUp: onUp ? () => onUp() : undefined,
    onSwipeDown: onDown ? () => onDown() : undefined,
    threshold,
    enableHapticFeedback
  });
};

/**
 * Hook for pull-to-refresh gesture
 */
interface UsePullToRefreshOptions {
  onRefresh: () => void | Promise<void>;
  threshold?: number;
  enableHapticFeedback?: boolean;
}

export const usePullToRefresh = (options: UsePullToRefreshOptions) => {
  const { onRefresh, threshold = 100, enableHapticFeedback = true } = options;
  const isRefreshingRef = useRef(false);

  const handleRefresh = useCallback(async () => {
    if (isRefreshingRef.current) return;
    
    isRefreshingRef.current = true;
    if (enableHapticFeedback) HapticFeedback.success();
    
    try {
      await onRefresh();
    } finally {
      isRefreshingRef.current = false;
    }
  }, [onRefresh, enableHapticFeedback]);

  return useTouchGestures({
    onSwipeDown: (distance) => {
      if (distance > threshold && window.scrollY === 0) {
        handleRefresh();
      }
    },
    threshold,
    enableHapticFeedback
  });
};

/**
 * Hook for long press context menu
 */
interface UseLongPressMenuOptions {
  onLongPress: (x: number, y: number) => void;
  enableHapticFeedback?: boolean;
}

export const useLongPressMenu = (options: UseLongPressMenuOptions) => {
  const { onLongPress, enableHapticFeedback = true } = options;

  return useTouchGestures({
    onLongPress,
    enableHapticFeedback
  });
};

/**
 * Hook for card swipe actions (like dismiss, archive, etc.)
 */
interface UseCardSwipeOptions {
  onSwipeLeftAction?: () => void;
  onSwipeRightAction?: () => void;
  threshold?: number;
  enableHapticFeedback?: boolean;
}

export const useCardSwipe = (options: UseCardSwipeOptions = {}) => {
  const {
    onSwipeLeftAction,
    onSwipeRightAction,
    threshold = 100,
    enableHapticFeedback = true
  } = options;

  return useTouchGestures({
    onSwipeLeft: onSwipeLeftAction ? () => onSwipeLeftAction() : undefined,
    onSwipeRight: onSwipeRightAction ? () => onSwipeRightAction() : undefined,
    threshold,
    enableHapticFeedback
  });
};