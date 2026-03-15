'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';

type View = 'playground' | 'dashboard';
type Mode = 'direct' | 'indirect';

interface AppState {
  currentView: View;
  currentMode: Mode;
}

type AppAction =
  | { type: 'SWITCH_VIEW'; payload: View }
  | { type: 'SWITCH_MODE'; payload: Mode };

interface AppContextType {
  state: AppState;
  switchView: (view: View) => void;
  switchMode: (mode: Mode) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialState: AppState = {
  currentView: 'playground',
  currentMode: 'direct'
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SWITCH_VIEW':
      return { ...state, currentView: action.payload };
    case 'SWITCH_MODE':
      return { ...state, currentMode: action.payload };
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const switchView = (view: View) => {
    dispatch({ type: 'SWITCH_VIEW', payload: view });
  };

  const switchMode = (mode: Mode) => {
    dispatch({ type: 'SWITCH_MODE', payload: mode });
  };

  return (
    <AppContext.Provider value={{ state, switchView, switchMode }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
