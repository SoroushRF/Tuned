'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { AppState, NeuroPrintVector, ProcessedOutput } from '@/types';
import { initialAppState, mockAudioLearner, mockADHDLearner } from '@/lib/mock';

/**
 * MOCK TOGGLE (Change this to switch learner types)
 */
const CURRENT_VECTOR = mockAudioLearner; 
const NEUROPRINT_STORAGE_KEY = 'tuned:neuroprint';

function loadStoredNeuroPrint(): NeuroPrintVector | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(NEUROPRINT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<NeuroPrintVector>;
    if (
      typeof parsed.audio === 'number' &&
      typeof parsed.adhd === 'number' &&
      typeof parsed.scholar === 'number' &&
      typeof parsed.lastUpdated === 'number' &&
      typeof parsed.manualOverride === 'boolean'
    ) {
      return parsed as NeuroPrintVector;
    }
  } catch {
    // Ignore corrupt persisted state and fall back to the default vector.
  }
  return null;
}

const buildInitialState = (): AppState => ({
  ...initialAppState,
  neuroPrint: loadStoredNeuroPrint() ?? CURRENT_VECTOR,
});

/**
 * Action Types
 */
type Action =
  | { type: 'SET_NEUROPRINT'; payload: NeuroPrintVector }
  | { type: 'SET_SESSION'; payload: ProcessedOutput }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | undefined }
  | { type: 'UPDATE_STREAK'; payload: number }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'RESET_SESSION' };

/**
 * App Reducer
 */
const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'SET_NEUROPRINT':
      return { ...state, neuroPrint: action.payload };
    case 'SET_SESSION':
      return { ...state, currentSession: action.payload, isLoading: false };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'UPDATE_STREAK':
      return { ...state, streak: action.payload };
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'RESET_SESSION':
      return { ...state, currentSession: undefined };
    default:
      return state;
  }
};

/**
 * Context Setup
 */
interface AppContextProps {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

/**
 * Global App Provider
 */
export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, undefined, buildInitialState);

  // Sync theme with HTML class
  React.useEffect(() => {
    const root = window.document.documentElement;
    if (state.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [state.theme]);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(NEUROPRINT_STORAGE_KEY, JSON.stringify(state.neuroPrint));
    } catch {
      // Ignore storage failures in private mode or quota-limited environments.
    }
  }, [state.neuroPrint]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

/**
 * High-level hook for using the context
 */
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
