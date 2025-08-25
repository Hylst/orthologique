import React, { useEffect, useState } from 'react';
import { MobileViewport } from '../utils/mobileInteractions';

interface MobileOptimizerProps {
  children: React.ReactNode;
}

/**
 * Component that optimizes performance and rendering for mobile devices
 * Implements lazy loading, reduced animations, and efficient rendering strategies
 */
const MobileOptimizer: React.FC<MobileOptimizerProps> = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isLowPerformance, setIsLowPerformance] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Detect mobile device
    const checkMobile = () => {
      setIsMobile(MobileViewport.isMobile());
    };

    // Detect low performance device
    const checkPerformance = () => {
      // Check for low-end device indicators
      const connection = (navigator as any).connection;
      const memory = (navigator as any).deviceMemory;
      const cores = navigator.hardwareConcurrency;

      const isLowEnd = (
        (memory && memory <= 2) || // Less than 2GB RAM
        (cores && cores <= 2) || // 2 or fewer CPU cores
        (connection && connection.effectiveType === 'slow-2g') || // Slow connection
        (connection && connection.effectiveType === '2g')
      );

      setIsLowPerformance(isLowEnd);
    };

    // Check for reduced motion preference
    const checkReducedMotion = () => {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      
      const handleChange = (e: MediaQueryListEvent) => {
        setPrefersReducedMotion(e.matches);
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    };

    checkMobile();
    checkPerformance();
    const cleanupReducedMotion = checkReducedMotion();

    window.addEventListener('resize', checkMobile);
    window.addEventListener('orientationchange', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('orientationchange', checkMobile);
      cleanupReducedMotion?.();
    };
  }, []);

  // Apply performance optimizations based on device capabilities
  useEffect(() => {
    const root = document.documentElement;
    
    if (isMobile) {
      root.classList.add('mobile-device');
    } else {
      root.classList.remove('mobile-device');
    }

    if (isLowPerformance) {
      root.classList.add('low-performance');
      // Disable expensive animations and effects
      root.style.setProperty('--animation-duration', '0.1s');
      root.style.setProperty('--transition-duration', '0.1s');
    } else {
      root.classList.remove('low-performance');
      root.style.removeProperty('--animation-duration');
      root.style.removeProperty('--transition-duration');
    }

    if (prefersReducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
  }, [isMobile, isLowPerformance, prefersReducedMotion]);

  // Intersection Observer for lazy loading on mobile
  useEffect(() => {
    if (!isMobile) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            target.classList.add('visible');
            
            // Load images lazily
            const lazyImages = target.querySelectorAll('img[data-src]');
            lazyImages.forEach((img) => {
              const image = img as HTMLImageElement;
              if (image.dataset.src) {
                image.src = image.dataset.src;
                image.removeAttribute('data-src');
              }
            });
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    // Observe all elements with lazy-load class
    const lazyElements = document.querySelectorAll('.lazy-load');
    lazyElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [isMobile]);

  // Request idle callback for non-critical tasks on mobile
  useEffect(() => {
    if (!isMobile) return;

    const scheduleIdleTask = (task: () => void) => {
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(task, { timeout: 5000 });
      } else {
        setTimeout(task, 1);
      }
    };

    // Schedule non-critical optimizations
    scheduleIdleTask(() => {
      // Preload critical resources
      const criticalImages = document.querySelectorAll('img[data-preload]');
      criticalImages.forEach((img) => {
        const image = new Image();
        const element = img as HTMLImageElement;
        if (element.dataset.preload) {
          image.src = element.dataset.preload;
        }
      });
    });
  }, [isMobile]);

  return (
    <div 
      className={`mobile-optimizer ${
        isMobile ? 'mobile-optimized' : ''
      } ${
        isLowPerformance ? 'low-performance-mode' : ''
      } ${
        prefersReducedMotion ? 'reduced-motion-mode' : ''
      }`}
    >
      {children}
    </div>
  );
};

export default MobileOptimizer;