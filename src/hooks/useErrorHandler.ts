import { useState, useCallback } from 'react';

export interface ErrorState {
  error: Error | null;
  isError: boolean;
  errorMessage: string;
}

export interface UseErrorHandlerReturn {
  errorState: ErrorState;
  handleError: (error: Error | string) => void;
  clearError: () => void;
  withErrorHandling: <T extends any[], R>(
    fn: (...args: T) => Promise<R>
  ) => (...args: T) => Promise<R | null>;
}

/**
 * Custom hook for robust error handling in functional components
 * Provides error state management and error boundary functionality
 */
export const useErrorHandler = (): UseErrorHandlerReturn => {
  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isError: false,
    errorMessage: ''
  });

  /**
   * Handle error by updating error state
   * @param error - Error object or error message string
   */
  const handleError = useCallback((error: Error | string) => {
    const errorObj = error instanceof Error ? error : new Error(error);
    const errorMessage = errorObj.message || 'Une erreur inattendue s\'est produite';
    
    console.error('Error handled by useErrorHandler:', errorObj);
    
    setErrorState({
      error: errorObj,
      isError: true,
      errorMessage
    });
  }, []);

  /**
   * Clear current error state
   */
  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      isError: false,
      errorMessage: ''
    });
  }, []);

  /**
   * Higher-order function to wrap async functions with error handling
   * @param fn - Async function to wrap
   * @returns Wrapped function that handles errors automatically
   */
  const withErrorHandling = useCallback(
    <T extends any[], R>(fn: (...args: T) => Promise<R>) => {
      return async (...args: T): Promise<R | null> => {
        try {
          clearError();
          return await fn(...args);
        } catch (error) {
          handleError(error instanceof Error ? error : new Error(String(error)));
          return null;
        }
      };
    },
    [handleError, clearError]
  );

  return {
    errorState,
    handleError,
    clearError,
    withErrorHandling
  };
};

/**
 * Hook for handling async operations with loading and error states
 */
export const useAsyncOperation = <T>() => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<T | null>(null);
  const { errorState, handleError, clearError } = useErrorHandler();

  /**
   * Execute async operation with automatic loading and error handling
   * @param operation - Async operation to execute
   */
  const execute = useCallback(
    async (operation: () => Promise<T>) => {
      try {
        setIsLoading(true);
        clearError();
        const result = await operation();
        setData(result);
        return result;
      } catch (error) {
        handleError(error instanceof Error ? error : new Error(String(error)));
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [handleError, clearError]
  );

  /**
   * Reset all states
   */
  const reset = useCallback(() => {
    setIsLoading(false);
    setData(null);
    clearError();
  }, [clearError]);

  return {
    isLoading,
    data,
    errorState,
    execute,
    reset
  };
};