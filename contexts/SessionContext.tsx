'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Session, ChatMessage, AttackRecord } from '@/types';

interface SessionState {
  currentSession: Session | null;
  messages: ChatMessage[];
  attackRecords: AttackRecord[];
}

type SessionAction =
  | { type: 'SET_SESSION'; payload: Session }
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'SET_MESSAGES'; payload: ChatMessage[] }
  | { type: 'ADD_ATTACK_RECORD'; payload: AttackRecord }
  | { type: 'CLEAR_MESSAGES' };

interface SessionContextType {
  state: SessionState;
  setSession: (session: Session) => void;
  addMessage: (message: ChatMessage) => void;
  setMessages: (messages: ChatMessage[]) => void;
  addAttackRecord: (record: AttackRecord) => void;
  clearMessages: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

const initialState: SessionState = {
  currentSession: null,
  messages: [],
  attackRecords: []
};

function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'SET_SESSION':
      return { ...state, currentSession: action.payload };
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };
    case 'ADD_ATTACK_RECORD':
      return { ...state, attackRecords: [...state.attackRecords, action.payload] };
    case 'CLEAR_MESSAGES':
      return { ...state, messages: [] };
    default:
      return state;
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(sessionReducer, initialState);

  const setSession = (session: Session) => {
    dispatch({ type: 'SET_SESSION', payload: session });
  };

  const addMessage = (message: ChatMessage) => {
    dispatch({ type: 'ADD_MESSAGE', payload: message });
  };

  const setMessages = (messages: ChatMessage[]) => {
    dispatch({ type: 'SET_MESSAGES', payload: messages });
  };

  const addAttackRecord = (record: AttackRecord) => {
    dispatch({ type: 'ADD_ATTACK_RECORD', payload: record });
  };

  const clearMessages = () => {
    dispatch({ type: 'CLEAR_MESSAGES' });
  };

  return (
    <SessionContext.Provider
      value={{ state, setSession, addMessage, setMessages, addAttackRecord, clearMessages }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
