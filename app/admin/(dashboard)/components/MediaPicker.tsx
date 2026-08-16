'use client';

import { useEffect, useRef, useState } from 'react';

export interface MediaVariant {
  id: string;
  label: string;
  path: string;
  width: number | null;
  height: number | null;
  format: string;
}

export interface MediaItem {
  id: string;
  type: string;
  filename: string;
  path: string;
  alt: string | null;
  width: number | null;
  height: number | null;
  duration: number | null;
  createdAt: string;
  variants: MediaVariant[];
}

export function thumbFor(item: MediaItem): string {
  if (item.type === 'IMAGE') {
    return item.variants.find((v) => v.label === 'thumb')?.path || item.path;
  }
  return item.variants.find((v) => v.label === 'poster')?.path || '';
}

interface MediaPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (item: MediaItem) => void;
  /** Restrict to images only (e.g. for cover/gallery) or allow video too */
  accept?: 'image' | 'all';
  /** Uploads made through this picker skip the watermark (e.g. hero slide backgrounds) */
  background?: boolean;
}

export default function MediaPicker({ open, onClose, onSelect, accept = 'all', background = false }: MediaPickerProps) {
  const [tab, setTab] = useState<'library' | 'upload'>('library');
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      loadMedia();
      setTab('library');
      setError('');
    }
  }, [open]);

  async function loadMedia() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/media');
      const data = await res.json();
      setMedia(data.media || []);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`/api/admin/media${background ? '?bg=1' : ''}`, { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Upload failed.');
      } else {
        onSelect(data.media);
        onClose();
      }
    } catch {
      setError('Upload failed — check your connection and try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  if (!open) return null;

  const filtered = accept === 'image' ? media.filter((m) => m.type === 'IMAGE') : media;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(13,13,13,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#F8F8F6',
          borderRadius: 4,
          width: '100%',
          maxWidth: 760,
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 20px',
            borderBottom: '0.5px solid #DEDBD4',
          }}
        >
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setTab('library')}
              style={tabButtonStyle(tab === 'library')}
            >
              MEDIA LIBRARY
            </button>
            <button
              onClick={() => setTab('upload')}
              style={tabButtonStyle(tab === 'upload')}
            >
              UPLOAD NEW
            </button>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#7A7870', lineHeight: 1 }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div style={{ padding: 20, overflowY: 'auto', flex: 1 }}>
          {error && <p style={{ color: '#B3434A', fontSize: 14, marginBottom: 16 }}>{error}</p>}

          {tab === 'upload' ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <label
                style={{
                  display: 'inline-block',
                  padding: '12px 24px',
                  background: uploading ? '#9C9890' : '#0D0D0D',
                  color: '#F8F8F6',
                  borderRadius: 2,
                  fontSize: 12,
                  letterSpacing: '0.14em',
                  fontWeight: 600,
                  cursor: uploading ? 'default' : 'pointer',
                }}
              >
                {uploading ? 'PROCESSING…' : 'CHOOSE FILE'}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={accept === 'image' ? 'image/*' : 'image/*,video/*'}
                  onChange={handleUpload}
                  disabled={uploading}
                  style={{ display: 'none' }}
                />
              </label>
              <p style={{ color: '#9C9890', fontSize: 13, marginTop: 16 }}>
                Uploading here adds it to the media library and selects it immediately.
              </p>
            </div>
          ) : loading ? (
            <p style={{ color: '#9C9890' }}>Loading…</p>
          ) : filtered.length === 0 ? (
            <p style={{ color: '#9C9890' }}>No media yet — switch to "Upload new" to add one.</p>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                gap: 12,
              }}
            >
              {filtered.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelect(item);
                    onClose();
                  }}
                  style={{
                    border: '0.5px solid #DEDBD4',
                    borderRadius: 4,
                    overflow: 'hidden',
                    background: '#fff',
                    cursor: 'pointer',
                    padding: 0,
                    textAlign: 'left',
                  }}
                >
                  <div style={{ aspectRatio: '4 / 3', background: '#0D0D0D', position: 'relative' }}>
                    {thumbFor(item) && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={thumbFor(item)}
                        alt={item.alt || item.filename}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    )}
                    {item.type === 'VIDEO' && (
                      <span
                        style={{
                          position: 'absolute',
                          top: 6,
                          left: 6,
                          background: 'rgba(13,13,13,0.6)',
                          color: '#F8F8F6',
                          fontSize: 10,
                          padding: '2px 6px',
                          borderRadius: 2,
                        }}
                      >
                        VIDEO
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      padding: '6px 8px',
                      color: '#7A7870',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                    title={item.filename}
                  >
                    {item.filename}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function tabButtonStyle(active: boolean): React.CSSProperties {
  return {
    padding: '8px 16px',
    fontSize: 11,
    letterSpacing: '0.12em',
    fontWeight: 600,
    border: 'none',
    borderRadius: 2,
    cursor: 'pointer',
    background: active ? '#0D0D0D' : 'transparent',
    color: active ? '#F8F8F6' : '#7A7870',
    fontFamily: 'inherit',
  };
}