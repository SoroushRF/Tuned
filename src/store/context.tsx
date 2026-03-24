'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { AppState, NeuroPrintVector, ProcessedOutput } from '@/types';
import { initialAppState } from '@/lib/mock';

/**
 * Action Types
 */
type Action =
  | { type: 'SET_NEUROPRINT'; payload: NeuroPrintVector }
  | { type: 'SET_SESSION'; payload: ProcessedOutput }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | undefined }
  | { type: 'UPDATE_STREAK'; payload: number }
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
  const [state, dispatch] = useReducer(appReducer, initialAppState);

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
