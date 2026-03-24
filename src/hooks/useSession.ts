import { useAppContext } from '@/store/context';
import { useCallback } from 'react';
import { ProcessedOutput } from '@/types';

/**
 * Parsa - Study Surface Hook
 * Manages the current study session state and loading transitions.
 */
export const useSession = () => {
  const { state, dispatch } = useAppContext();

  const startSession = useCallback((session: ProcessedOutput) => {
    dispatch({ type: 'SET_SESSION', payload: session });
  }, [dispatch]);

  const endSession = useCallback(() => {
    dispatch({ type: 'RESET_SESSION' });
  }, [dispatch]);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, [dispatch]);

  const setError = useCallback((error: string | undefined) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, [dispatch]);

  return {
    session: state.currentSession,
    isLoading: state.isLoading,
    error: state.error,
    startSession,
    endSession,
    setLoading,
    setError,
    streak: state.streak
  };
};
