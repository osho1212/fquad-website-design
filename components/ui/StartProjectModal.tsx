'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useStartProjectModal } from './StartProjectModalContext';
import { StartProjectForm } from './StartProjectForm';

export function StartProjectModal() {
  const { isOpen, closeModal, initialData } = useStartProjectModal();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Never dismiss mid-submit — the request would be orphaned.
  const handleClose = useCallback(() => {
    if (isSubmitting) return;
    closeModal();
  }, [isSubmitting, closeModal]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  return (
    <div
      data-lenis-prevent
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-2xl bg-[#0e0e0e] border border-white/20 shadow-2xl my-auto text-white max-h-[92vh] flex flex-col rounded-none"
      >
        {/* Top Header Bar */}
        <div className="sticky top-0 z-20 bg-[#0e0e0e]/95 backdrop-blur-md px-6 sm:px-8 py-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[11px] tracking-[0.24em] text-white/50 uppercase font-medium block mb-1">
              F.QUAD STUDIO · PROJECT INTAKE
            </span>
            <h2 className="m-0 font-display text-xl sm:text-2xl tracking-[0.14em] uppercase text-white font-medium">
              START A PROJECT
            </h2>
          </div>

          <button
            onClick={handleClose}
            aria-label="Close window"
            className="w-8 h-8 rounded-none border border-white/20 hover:border-white text-white/70 hover:text-white flex items-center justify-center text-sm transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar flex-1">
          <StartProjectForm
            initialData={initialData}
            onClose={handleClose}
            onSubmittingChange={setIsSubmitting}
          />
        </div>
      </div>
    </div>
  );
}
