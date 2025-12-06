'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const WhiteboardContext = createContext({
  isOpen: false,
  openWhiteboard: () => {},
  closeWhiteboard: () => {},
  toggleWhiteboard: () => {},
});

export function WhiteboardProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load persisted state from sessionStorage
    if (typeof window !== 'undefined') {
      const savedState = sessionStorage.getItem('whiteboard-open');
      if (savedState === 'true') {
        setIsOpen(true);
      }
    }
  }, []);

  const openWhiteboard = useCallback(() => {
    setIsOpen(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('whiteboard-open', 'true');
    }
  }, []);

  const closeWhiteboard = useCallback(() => {
    setIsOpen(false);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('whiteboard-open', 'false');
    }
  }, []);

  const toggleWhiteboard = useCallback(() => {
    setIsOpen(prev => {
      const newState = !prev;
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('whiteboard-open', String(newState));
      }
      return newState;
    });
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <WhiteboardContext.Provider
      value={{
        isOpen,
        openWhiteboard,
        closeWhiteboard,
        toggleWhiteboard,
      }}
    >
      {children}
    </WhiteboardContext.Provider>
  );
}

export function useWhiteboard() {
  const context = useContext(WhiteboardContext);
  if (context === undefined) {
    throw new Error('useWhiteboard must be used within a WhiteboardProvider');
  }
  return context;
}