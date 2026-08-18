'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useStartProjectModal } from './StartProjectModalContext';

const PROJECT_TYPES = [
  'Residential Architecture',
  'Commercial & Workplace',
  'Luxury Interior Design',
  'Villa / Bungalow',
  'Hospitality & Retail',
  'Turnkey (Design + Build)',
  'Other',
];

const PROJECT_STAGES = [
  { id: 'open_land', label: 'Open land, yet to start', num: '01' },
  { id: 'under_construction', label: 'Under construction', num: '02' },
  { id: 'renovation', label: 'Renovation', num: '03' },
  { id: 'newly_built', label: 'Newly Built', num: '04' },
  { id: 'unfinished', label: 'Unfinished', num: '05' },
];

const TIMELINES = [
  'Immediate (1–3 mos)',
  '3 – 6 months',
  '6 – 12 months',
  'Planning phase',
];

const BUDGET_RANGES = [
  'Under ₹50 Lakhs',
  '₹50L – ₹1.5 Cr',
  '₹1.5 Cr – ₹3 Cr',
  '₹3 Cr – ₹5 Cr',
  '₹5 Cr+',
  'To Be Discussed',
];

export function StartProjectModal() {
  const { isOpen, closeModal, initialData } = useStartProjectModal();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState(true);
  const [projectType, setProjectType] = useState('Residential Architecture');
  const [customProjectType, setCustomProjectType] = useState('');
  const [sftArea, setSftArea] = useState('');
  const [location, setLocation] = useState('');
  const [stage, setStage] = useState('Open land, yet to start');
  const [timeline, setTimeline] = useState('3 – 6 months');
  const [budget, setBudget] = useState('₹1.5 Cr – ₹3 Cr');
  const [notes, setNotes] = useState('');
  const [planFile, setPlanFile] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Sync initialData if provided
  useEffect(() => {
    if (initialData) {
      if (initialData.name) setName(initialData.name);
      if (initialData.email) setEmail(initialData.email);
      if (initialData.phone) setPhone(initialData.phone);
      if (initialData.projectType) setProjectType(initialData.projectType);
      if (initialData.sftArea) setSftArea(initialData.sftArea);
      if (initialData.location) setLocation(initialData.location);
      if (initialData.stage) setStage(initialData.stage);
    }
  }, [initialData]);

  // Reset form on close or after success
  const handleClose = () => {
    if (isSubmitting) return;
    closeModal();
    setTimeout(() => {
      setIsSuccess(false);
      setErrorMessage('');
    }, 300);
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 30MB)
      if (file.size > 30 * 1024 * 1024) {
        setErrorMessage('File size exceeds 30MB. Please upload a smaller file or link.');
        return;
      }
      setPlanFile(file);
      setErrorMessage('');
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.size > 30 * 1024 * 1024) {
        setErrorMessage('File size exceeds 30MB. Please upload a smaller file.');
        return;
      }
      setPlanFile(file);
      setErrorMessage('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }
    if (!phone.trim()) {
      setErrorMessage('Please enter your contact phone number.');
      return;
    }

    setIsSubmitting(true);

    try {
      const finalProjectType = projectType === 'Other' && customProjectType.trim() 
        ? customProjectType.trim() 
        : projectType;

      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('email', email.trim());
      formData.append('phone', phone.trim());
      formData.append('whatsapp', whatsapp ? 'true' : 'false');
      formData.append('projectType', finalProjectType);
      formData.append('sftArea', sftArea.trim());
      formData.append('location', location.trim());
      formData.append('stage', stage);
      formData.append('timeline', timeline);
      formData.append('budget', budget);
      formData.append('notes', notes.trim());

      if (planFile) {
        formData.append('planFile', planFile);
      }

      const res = await fetch('/api/start-project', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit project brief');
      }

      setIsSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
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
            <span className="text-[9px] tracking-[0.24em] text-white/50 uppercase font-medium block mb-1">
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
          {isSuccess ? (
            <div className="py-12 px-4 text-center">
              <div className="w-14 h-14 mx-auto mb-6 rounded-none border border-white/40 flex items-center justify-center text-xl text-white bg-white/5">
                ✓
              </div>
              <h3 className="font-display text-2xl tracking-[0.14em] uppercase text-white mb-3">
                PROJECT BRIEF RECEIVED
              </h3>
              <p className="text-sm sm:text-base text-white/70 max-w-[48ch] mx-auto leading-relaxed mb-8">
                Thank you, <strong className="text-white">{name}</strong>. Our principal architects will review your project requirements for <strong className="text-white">{location || 'your space'}</strong> and contact you within 24 hours.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href={`https://wa.me/919876543210?text=Hi%20F.QUAD%20Studio,%20I%20just%20submitted%20a%20project%20brief%20for%20${encodeURIComponent(name)}.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 border border-white/30 hover:border-white text-white text-[10px] tracking-[0.2em] uppercase font-medium transition-colors"
                >
                  CHAT ON WHATSAPP →
                </a>
                <button
                  onClick={handleClose}
                  className="btn-metallic text-[10px] tracking-[0.2em] px-6 py-3 uppercase font-medium"
                >
                  CLOSE WINDOW
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-7">
              {errorMessage && (
                <div className="p-3.5 bg-red-950/40 border border-red-500/40 text-red-200 text-xs tracking-wide">
                  {errorMessage}
                </div>
              )}

              {/* 1. Client Contact Info */}
              <div className="space-y-4">
                <div className="text-[10px] tracking-[0.2em] uppercase text-white/50 font-medium">
                  01 · CONTACT DETAILS
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10.5px] uppercase tracking-[0.14em] text-white/75 mb-1.5 font-medium">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/20 focus:border-white px-3.5 py-2.5 text-xs text-white placeholder:text-white/30 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10.5px] uppercase tracking-[0.14em] text-white/75 mb-1.5 font-medium">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. rahul@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/20 focus:border-white px-3.5 py-2.5 text-xs text-white placeholder:text-white/30 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="block text-[10.5px] uppercase tracking-[0.14em] text-white/75 mb-1.5 font-medium">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/20 focus:border-white px-3.5 py-2.5 text-xs text-white placeholder:text-white/30 outline-none transition-colors"
                    />
                  </div>
                  <div className="pt-2 sm:pt-6">
                    <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-white/75 hover:text-white select-none">
                      <input
                        type="checkbox"
                        checked={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.checked)}
                        className="rounded-none border-white/40 bg-black text-white focus:ring-0 w-4 h-4 cursor-pointer"
                      />
                      <span>Prefer WhatsApp updates</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10" />

              {/* 2. Type of Project */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] tracking-[0.2em] uppercase text-white/50 font-medium">
                    02 · TYPE OF PROJECT →
                  </label>
                </div>
                <div className="flex flex-wrap gap-2">
                  {PROJECT_TYPES.map((type) => {
                    const isSelected = projectType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setProjectType(type)}
                        className={`text-[11px] px-3.5 py-2 border rounded-none transition-all uppercase tracking-wider ${
                          isSelected
                            ? 'bg-white text-black font-semibold border-white shadow-lg'
                            : 'bg-white/[0.02] text-white/75 border-white/20 hover:border-white/50 hover:text-white'
                        }`}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
                {projectType === 'Other' && (
                  <input
                    type="text"
                    placeholder="Specify project type..."
                    value={customProjectType}
                    onChange={(e) => setCustomProjectType(e.target.value)}
                    className="mt-2 w-full bg-white/[0.04] border border-white/20 focus:border-white px-3.5 py-2 text-xs text-white placeholder:text-white/30 outline-none"
                  />
                )}
              </div>

              {/* 3. Sft. area & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-white/50 font-medium mb-1.5">
                    03 · SFT. AREA →
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. 5,000"
                      value={sftArea}
                      onChange={(e) => setSftArea(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/20 focus:border-white px-3.5 py-2.5 text-xs text-white placeholder:text-white/30 outline-none pr-16"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-white/40 uppercase tracking-widest pointer-events-none">
                      SQ.FT
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-white/50 font-medium mb-1.5">
                    04 · LOCATION →
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Jubilee Hills, Hyderabad"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/20 focus:border-white px-3.5 py-2.5 text-xs text-white placeholder:text-white/30 outline-none"
                  />
                </div>
              </div>

              <div className="border-t border-white/10" />

              {/* 4. Stage (bracketed list, circled) */}
              <div className="space-y-3">
                <label className="block text-[10px] tracking-[0.2em] uppercase text-white/50 font-medium">
                  05 · STAGE → (SELECT CURRENT STATUS)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {PROJECT_STAGES.map((s) => {
                    const isSelected = stage === s.label;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setStage(s.label)}
                        className={`flex items-center gap-3 px-3.5 py-3 border text-left rounded-none transition-all ${
                          isSelected
                            ? 'border-white bg-white/10 text-white'
                            : 'border-white/15 bg-white/[0.02] text-white/70 hover:border-white/40 hover:text-white'
                        }`}
                      >
                        {/* Bracketed & Circled bullet */}
                        <span className="font-mono text-xs text-white/50 font-light">
                          [{' '}
                          <span
                            className={`inline-block w-2.5 h-2.5 rounded-full border align-middle transition-colors ${
                              isSelected
                                ? 'bg-white border-white'
                                : 'border-white/40 bg-transparent'
                            }`}
                          />{' '}
                          ]
                        </span>
                        <span className="text-xs tracking-wide">{s.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-white/10" />

              {/* 5. Timeline & Budget */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2.5">
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-white/50 font-medium">
                    06 · TIMELINE — APPROX.
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {TIMELINES.map((t) => {
                      const isSelected = timeline === t;
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setTimeline(t)}
                          className={`text-[10px] px-2.5 py-1.5 border rounded-none transition-all uppercase tracking-wider ${
                            isSelected
                              ? 'bg-white text-black font-semibold border-white'
                              : 'bg-white/[0.02] text-white/70 border-white/20 hover:border-white/40'
                          }`}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2.5">
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-white/50 font-medium">
                    07 · BUDGET:—
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {BUDGET_RANGES.map((b) => {
                      const isSelected = budget === b;
                      return (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setBudget(b)}
                          className={`text-[10px] px-2.5 py-1.5 border rounded-none transition-all uppercase tracking-wider ${
                            isSelected
                              ? 'bg-white text-black font-semibold border-white'
                              : 'bg-white/[0.02] text-white/70 border-white/20 hover:border-white/40'
                          }`}
                        >
                          {b}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10" />

              {/* 6. Upload Plan (any) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-white/50 font-medium">
                    08 · UPLOAD PLAN (ANY)
                  </label>
                  <span className="text-[10px] font-mono text-white/40 tracking-wider">
                    [ pdf, JPG, CAD (.dwg format) ]
                  </span>
                </div>

                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border border-dashed p-4 text-center cursor-pointer transition-colors bg-white/[0.02] hover:bg-white/[0.04] ${
                    planFile ? 'border-white/60 bg-white/5' : 'border-white/25 hover:border-white/50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.dwg,.dxf"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {planFile ? (
                    <div className="flex items-center justify-between px-2">
                      <div className="flex items-center gap-2.5 text-left truncate">
                        <span className="text-base">📄</span>
                        <div className="truncate">
                          <p className="text-xs text-white font-medium truncate">{planFile.name}</p>
                          <p className="text-[10px] text-white/40">
                            {(planFile.size / (1024 * 1024)).toFixed(2)} MB · Ready to send
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPlanFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="text-[10px] tracking-widest uppercase text-white/60 hover:text-white px-2 py-1 border border-white/20"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs text-white/80 font-medium mb-1">
                        Drag & Drop or <span className="underline underline-offset-2">Browse file</span>
                      </p>
                      <p className="text-[10px] text-white/40">
                        Supports PDF, JPG/PNG images, and CAD drawing files (.dwg, .dxf) up to 30MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* 7. Additional Notes */}
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-white/50 font-medium mb-1.5">
                  09 · SPECIFIC REQUIREMENTS / NOTES (OPTIONAL)
                </label>
                <textarea
                  rows={3}
                  placeholder="Any particular design goals, family requirements, site constraints, or architectural references..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/20 focus:border-white p-3 text-xs text-white placeholder:text-white/30 outline-none resize-none"
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-metallic w-full py-4 text-xs font-medium tracking-[0.2em] uppercase flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>TRANSMITTING BRIEF...</span>
                  ) : (
                    <span>SUBMIT PROJECT BRIEF →</span>
                  )}
                </button>
                <p className="text-center text-[10px] text-white/40 tracking-wider mt-3 uppercase">
                  CONFIDENTIAL & SECURE · DIRECT REVIEW BY FOUNDING PARTNERS
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
