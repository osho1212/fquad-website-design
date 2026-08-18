'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface StartProjectFormData {
  name: string;
  email: string;
  phone: string;
  whatsapp: boolean;
  projectType: string;
  sftArea: string;
  location: string;
  stage: string;
  timeline: string;
  budget: string;
  notes: string;
}

interface StartProjectModalContextType {
  isOpen: boolean;
  openModal: (initialData?: Partial<StartProjectFormData>) => void;
  closeModal: () => void;
  initialData: Partial<StartProjectFormData> | null;
}

const StartProjectModalContext = createContext<StartProjectModalContextType | undefined>(undefined);

export function StartProjectProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [initialData, setInitialData] = useState<Partial<StartProjectFormData> | null>(null);

  const openModal = useCallback((data?: Partial<StartProjectFormData>) => {
    if (data) setInitialData(data);
    else setInitialData(null);
    setIsOpen(true);
    // Prevent background scrolling when modal is open
    document.body.style.overflow = 'hidden';
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setInitialData(null);
    document.body.style.overflow = '';
  }, []);

  // Global listener for click triggers (e.g. any button/link with data-start-project or href="#start-project")
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('[data-start-project], [href="#start-project"], [href="/#start-project"]');
      if (target) {
        e.preventDefault();
        openModal();
      }
    };

    const handleCustomEvent = (e: Event) => {
      const customEvent = e as CustomEvent<Partial<StartProjectFormData>>;
      openModal(customEvent.detail);
    };

    window.addEventListener('click', handleGlobalClick);
    window.addEventListener('open-start-project', handleCustomEvent);

    return () => {
      window.removeEventListener('click', handleGlobalClick);
      window.removeEventListener('open-start-project', handleCustomEvent);
    };
  }, [openModal]);

  return (
    <StartProjectModalContext.Provider value={{ isOpen, openModal, closeModal, initialData }}>
      {children}
    </StartProjectModalContext.Provider>
  );
}

export function useStartProjectModal() {
  const context = useContext(StartProjectModalContext);
  if (!context) {
    throw new Error('useStartProjectModal must be used within a StartProjectProvider');
  }
  return context;
}
