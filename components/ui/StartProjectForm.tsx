'use client';

import React, { useState, useRef, useEffect, useId } from 'react';
import { sendFile } from '@/lib/upload-client';

const PROJECT_TYPES = [
  'Residential Architecture',
  'Commercial & Workplace',
  'Luxury Interior Design',
  'Farmhouse & Estate',
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

export interface StartProjectInitialData {
  name?: string;
  email?: string;
  phone?: string;
  projectType?: string;
  sftArea?: string;
  location?: string;
  stage?: string;
}

export interface StartProjectFormProps {
  initialData?: StartProjectInitialData | null;
  /** Supplied by the modal so its success state can offer a close button. */
  onClose?: () => void;
  /** Lets a host (the modal) block dismissal while a submit is in flight. */
  onSubmittingChange?: (submitting: boolean) => void;
}

/**
 * The project intake form. Shared by the Start A Project modal and the
 * /contact page so both stay in step — edit the fields once, here.
 */
export function StartProjectForm({
  initialData,
  onClose,
  onSubmittingChange,
}: StartProjectFormProps) {
  const uid = useId();
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

  useEffect(() => {
    onSubmittingChange?.(isSubmitting);
  }, [isSubmitting, onSubmittingChange]);

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
    // Read before any await: the event's form is gone afterwards.
    const hpField = (e.currentTarget as HTMLFormElement).elements.namedItem('fq_hp_url');
    const honeypot = hpField instanceof HTMLInputElement ? hpField.value : '';

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
      const finalProjectType =
        projectType === 'Other' && customProjectType.trim()
          ? customProjectType.trim()
          : projectType;

      // A plan goes straight to storage first (the app cannot take large
      // uploads); the brief then names it.
      let planFileId: string | undefined;
      if (planFile) {
        const ticketRes = await fetch('/api/start-project/upload-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: planFile.name, size: planFile.size }),
        });
        const ticket = await ticketRes.json().catch(() => ({}));
        if (!ticketRes.ok) throw new Error(ticket.error || 'Could not attach the file. Please try again.');
        await sendFile(ticket.upload, planFile);
        planFileId = ticket.fileId;
      }

      const res = await fetch('/api/start-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          whatsapp,
          projectType: finalProjectType,
          sftArea: sftArea.trim(),
          location: location.trim(),
          stage,
          timeline,
          budget,
          notes: notes.trim(),
          fq_hp_url: honeypot,
          planFileId,
          planFileName: planFile?.name,
        }),
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

  if (isSuccess) {
    return (
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
            className="px-6 py-3 border border-white/30 hover:border-white text-white text-[11px] tracking-[0.2em] uppercase font-medium transition-colors"
          >
            CHAT ON WHATSAPP →
          </a>
          {onClose ? (
            <button
              onClick={onClose}
              className="btn-metallic text-[11px] tracking-[0.2em] px-6 py-3 uppercase font-medium"
            >
              CLOSE WINDOW
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsSuccess(false)}
              className="btn-metallic text-[11px] tracking-[0.2em] px-6 py-3 uppercase font-medium cursor-pointer"
            >
              SUBMIT ANOTHER →
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      {/* Honeypot: invisible and unreachable for people, tempting for form-filling
          bots. Anything typed here means the submission is automated. */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, overflow: 'hidden' }}>
        <label>
          Leave this field empty
          <input type="text" name="fq_hp_url" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>
      {errorMessage && (
        <div role="alert" className="p-3.5 bg-red-950/40 border border-red-500/40 text-red-200 text-xs tracking-wide">
          {errorMessage}
        </div>
      )}

      {/* 1. Client Contact Info */}
      <div className="space-y-4">
        <div className="text-[11px] tracking-[0.2em] uppercase text-white/50 font-medium">
          01 · CONTACT DETAILS
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor={`${uid}-name`} className="block text-[11px] uppercase tracking-[0.14em] text-white/75 mb-1.5 font-medium">
              Your Name *
            </label>
            <input id={`${uid}-name`}
              type="text"
              autoComplete="name"
              required
              placeholder="e.g. Rahul Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/20 focus:border-white px-3.5 py-2.5 text-xs text-white placeholder:text-white/30 outline-none transition-colors"
            />
          </div>
          <div>
            <label htmlFor={`${uid}-email`} className="block text-[11px] uppercase tracking-[0.14em] text-white/75 mb-1.5 font-medium">
              Email Address *
            </label>
            <input id={`${uid}-email`}
              type="email"
              autoComplete="email"
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
            <label htmlFor={`${uid}-phone`} className="block text-[11px] uppercase tracking-[0.14em] text-white/75 mb-1.5 font-medium">
              Phone Number *
            </label>
            <input id={`${uid}-phone`}
              type="tel"
              autoComplete="tel"
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
          <div id={`${uid}-type`} className="text-[11px] tracking-[0.2em] uppercase text-white/50 font-medium">
            02 · TYPE OF PROJECT →
          </div>
        </div>
        <div role="group" aria-labelledby={`${uid}-type`} className="flex flex-wrap gap-2">
          {PROJECT_TYPES.map((type) => {
            const isSelected = projectType === type;
            return (
              <button
                key={type}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setProjectType(type)}
                className={`text-[11px] px-3.5 py-2.5 min-h-[40px] border rounded-none transition-all uppercase tracking-wider ${
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
            aria-label="Specify your project type"
            value={customProjectType}
            onChange={(e) => setCustomProjectType(e.target.value)}
            className="mt-2 w-full bg-white/[0.04] border border-white/20 focus:border-white px-3.5 py-2 text-xs text-white placeholder:text-white/30 outline-none"
          />
        )}
      </div>

      {/* 3. Sft. area & Location */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor={`${uid}-area`} className="block text-[11px] tracking-[0.2em] uppercase text-white/50 font-medium mb-1.5">
            03 · SFT. AREA →
          </label>
          <div className="relative">
            <input id={`${uid}-area`}
              type="text"
              placeholder="e.g. 5,000"
              value={sftArea}
              onChange={(e) => setSftArea(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/20 focus:border-white px-3.5 py-2.5 text-xs text-white placeholder:text-white/30 outline-none pr-16"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-white/40 uppercase tracking-widest pointer-events-none">
              SQ.FT
            </span>
          </div>
        </div>

        <div>
          <label htmlFor={`${uid}-location`} className="block text-[11px] tracking-[0.2em] uppercase text-white/50 font-medium mb-1.5">
            04 · LOCATION →
          </label>
          <input id={`${uid}-location`}
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
        <div id={`${uid}-stage`} className="block text-[11px] tracking-[0.2em] uppercase text-white/50 font-medium">
          05 · STAGE → (SELECT CURRENT STATUS)
        </div>
        <div role="group" aria-labelledby={`${uid}-stage`} className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {PROJECT_STAGES.map((s) => {
            const isSelected = stage === s.label;
            return (
              <button
                key={s.id}
                type="button"
                aria-pressed={isSelected}
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
          <div id={`${uid}-timeline`} className="block text-[11px] tracking-[0.2em] uppercase text-white/50 font-medium">
            06 · TIMELINE — APPROX.
          </div>
          <div role="group" aria-labelledby={`${uid}-timeline`} className="flex flex-wrap gap-1.5">
            {TIMELINES.map((t) => {
              const isSelected = timeline === t;
              return (
                <button
                  key={t}
                  type="button"
                  aria-pressed={isSelected}
                onClick={() => setTimeline(t)}
                  className={`text-[11px] px-3 py-2 min-h-[36px] border rounded-none transition-all uppercase tracking-wider ${
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
          <div id={`${uid}-budget`} className="block text-[11px] tracking-[0.2em] uppercase text-white/50 font-medium">
            07 · BUDGET:—
          </div>
          <div role="group" aria-labelledby={`${uid}-budget`} className="flex flex-wrap gap-1.5">
            {BUDGET_RANGES.map((b) => {
              const isSelected = budget === b;
              return (
                <button
                  key={b}
                  type="button"
                  aria-pressed={isSelected}
                onClick={() => setBudget(b)}
                  className={`text-[11px] px-3 py-2 min-h-[36px] border rounded-none transition-all uppercase tracking-wider ${
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
          <div id={`${uid}-plan`} className="block text-[11px] tracking-[0.2em] uppercase text-white/50 font-medium">
            08 · UPLOAD PLAN (ANY)
          </div>
          <span className="text-[11px] font-mono text-white/40 tracking-wider">
            [ pdf, JPG, CAD (.dwg format) ]
          </span>
        </div>

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
          aria-labelledby={`${uid}-plan`}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`border border-dashed p-4 text-center cursor-pointer transition-colors bg-white/[0.02] hover:bg-white/[0.04] ${
            planFile ? 'border-white/60 bg-white/5' : 'border-white/25 hover:border-white/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            aria-label="Upload a plan file (PDF, JPG, PNG, DWG or DXF)"
            tabIndex={-1}
            accept=".pdf,.jpg,.jpeg,.png,.dwg,.dxf"
            onChange={handleFileChange}
            className="hidden"
          />

          {planFile ? (
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2.5 text-left truncate">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="w-5 h-5 shrink-0 text-white/70" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square">
                  <path d="M6 3h8l4 4v14H6z" />
                  <path d="M14 3v4h4M9 12h6M9 16h6" />
                </svg>
                <div className="truncate">
                  <p className="text-xs text-white font-medium truncate">{planFile.name}</p>
                  <p className="text-[11px] text-white/40">
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
                className="text-[11px] tracking-widest uppercase text-white/60 hover:text-white px-2 py-1 border border-white/20"
              >
                Remove
              </button>
            </div>
          ) : (
            <div>
              <p className="text-xs text-white/80 font-medium mb-1">
                Drag & Drop or <span className="underline underline-offset-2">Browse file</span>
              </p>
              <p className="text-[11px] text-white/40">
                Supports PDF, JPG/PNG images, and CAD drawing files (.dwg, .dxf) up to 30MB
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 7. Additional Notes */}
      <div>
        <label htmlFor={`${uid}-notes`} className="block text-[11px] tracking-[0.2em] uppercase text-white/50 font-medium mb-1.5">
          09 · SPECIFIC REQUIREMENTS / NOTES (OPTIONAL)
        </label>
        <textarea id={`${uid}-notes`}
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
        <p className="text-center text-[11px] text-white/40 tracking-wider mt-3 uppercase">
          CONFIDENTIAL &amp; SECURE · DIRECT REVIEW BY FOUNDING PARTNERS
        </p>
        <p className="text-center text-xs text-white/50 leading-relaxed mt-3">
          By submitting, you agree to our{' '}
          <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-white">
            Terms
          </a>{' '}
          and consent to us using your details, as described in our{' '}
          <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-white">
            Privacy Policy
          </a>
          , to respond to your enquiry.
        </p>
      </div>
    </form>
  );
}
