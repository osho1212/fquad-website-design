'use client';

import { useEffect, useRef, useState } from 'react';

interface MediaVariant {
  id: string;
  label: string;
  path: string;
  width: number | null;
  height: number | null;
  format: string;
}

interface MediaItem {
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
  folderId: string | null;
}

interface Folder {
  id: string;
  name: string;
  projectId: string | null;
  createdAt: string;
}

function thumbFor(item: MediaItem): string {
  if (item.type === 'IMAGE') {
    return item.variants.find((v) => v.label === 'thumb')?.path || item.path;
  }
  return item.variants.find((v) => v.label === 'poster')?.path || '';
}

export default function MediaLibraryPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [uploadFolder, setUploadFolder] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  async function loadFolders() {
    const res = await fetch('/api/admin/media-folders');
    const data = await res.json();
    setFolders(data.folders || []);
  }

  useEffect(() => {
    loadMedia();
    loadFolders();
  }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    setError('');
    setUploadProgress({ current: 0, total: files.length });

    for (let i = 0; i < files.length; i++) {
      setUploadProgress({ current: i + 1, total: files.length });

      const formData = new FormData();
      formData.append('file', files[i]);
      if (uploadFolder) formData.append('folderId', uploadFolder);

      try {
        const res = await fetch('/api/admin/media', { method: 'POST', body: formData });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error || `Upload failed for ${files[i].name}.`);
        }
      } catch {
        setError(`Upload failed for ${files[i].name} — check your connection and try again.`);
      }
    }

    await loadMedia();
    setUploading(false);
    setUploadProgress({ current: 0, total: 0 });
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleNewFolder() {
    const name = prompt('Folder name:');
    if (!name || !name.trim()) return;
    const res = await fetch('/api/admin/media-folders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() }),
    });
    if (res.ok) {
      const data = await res.json();
      setFolders((prev) => [...prev, data.folder]);
    } else {
      alert('Failed to create folder.');
    }
  }

  async function handleDeleteFolder(id: string, name: string) {
    if (!confirm(`Delete folder "${name}"? Media inside is not deleted, just unfiled.`)) return;
    const res = await fetch(`/api/admin/media-folders/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setFolders((prev) => prev.filter((f) => f.id !== id));
      if (selectedFolder === id) setSelectedFolder(null);
    } else {
      alert('Delete failed.');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this file? This cannot be undone.')) return;

    const res = await fetch(`/api/admin/media/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setMedia((prev) => prev.filter((m) => m.id !== id));
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.error || 'Delete failed.');
    }
  }

  const filteredMedia = selectedFolder === null ? media : media.filter((m) => m.folderId === selectedFolder);

  return (
    <div style={{ display: 'flex', gap: 24 }}>
      <aside style={{ width: 200, flexShrink: 0 }}>
        <div
          onClick={() => setSelectedFolder(null)}
          style={{
            padding: '8px 12px', cursor: 'pointer', fontSize: 13, borderRadius: 2, marginBottom: 4,
            fontWeight: selectedFolder === null ? 700 : 400,
            background: selectedFolder === null ? '#F0EEE8' : 'transparent',
          }}
        >
          All Media
        </div>
        {folders.map((f) => (
          <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <div
              onClick={() => setSelectedFolder(f.id)}
              style={{
                flex: 1, padding: '8px 12px', cursor: 'pointer', fontSize: 13, borderRadius: 2, marginBottom: 4,
                wordBreak: 'break-word',
                fontWeight: selectedFolder === f.id ? 700 : 400,
                background: selectedFolder === f.id ? '#F0EEE8' : 'transparent',
              }}
            >
              {f.name}
            </div>
            <button
              onClick={() => handleDeleteFolder(f.id, f.name)}
              style={{ background: 'none', border: 'none', color: '#9C9890', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: '4px 6px' }}
              aria-label="Delete folder"
            >
              ×
            </button>
          </div>
        ))}
        <button
          onClick={handleNewFolder}
          style={{ marginTop: 12, fontSize: 11, letterSpacing: '0.08em', color: '#0D0D0D', background: 'none', border: '1px solid #DEDBD4', borderRadius: 2, padding: '8px 12px', cursor: 'pointer', width: '100%', fontFamily: 'inherit', fontWeight: 600 }}
        >
          + NEW FOLDER
        </button>
      </aside>

      <div style={{ flex: 1, minWidth: 0 }}>
        <h1 style={{ fontSize: 28, marginBottom: 8 }}>Media Library</h1>
        <p style={{ color: '#7A7870', marginBottom: 24, fontSize: 15, maxWidth: 560, lineHeight: 1.7 }}>
          Upload images or video — images get resized into thumb/medium/full + WebP
          versions automatically (and watermarked), and video gets compressed with a
          poster frame generated. Large videos may take a minute to process.
        </p>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
          <label
            style={{
              display: 'inline-block', padding: '12px 24px', borderRadius: 2, fontSize: 12,
              letterSpacing: '0.14em', fontWeight: 600, cursor: uploading ? 'default' : 'pointer',
              background: uploading ? '#9C9890' : '#0D0D0D', color: '#F8F8F6',
            }}
          >
            {uploading ? `UPLOADING ${uploadProgress.current} OF ${uploadProgress.total}…` : 'UPLOAD FILES'}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleUpload}
              disabled={uploading}
              style={{ display: 'none' }}
            />
          </label>

          <select
            value={uploadFolder}
            onChange={(e) => setUploadFolder(e.target.value)}
            style={{ padding: '10px 12px', border: '1px solid #DEDBD4', borderRadius: 2, fontSize: 13, fontFamily: 'inherit' }}
          >
            <option value="">No folder</option>
            {folders.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>

        {uploading && (
          <div style={{ width: '100%', maxWidth: 320, height: 3, background: '#DEDBD4', borderRadius: 2, overflow: 'hidden', marginBottom: 24 }}>
            <div
              style={{
                height: '100%',
                width: `${(uploadProgress.current / Math.max(1, uploadProgress.total)) * 100}%`,
                background: '#0D0D0D',
                transition: 'width 0.2s ease',
              }}
            />
          </div>
        )}

        {error && <p style={{ color: '#B3434A', fontSize: 14, marginBottom: 16 }}>{error}</p>}

        {loading ? (
          <p style={{ color: '#9C9890' }}>Loading…</p>
        ) : filteredMedia.length === 0 ? (
          <p style={{ color: '#9C9890' }}>
            {selectedFolder ? 'No media in this folder.' : 'No media yet — upload your first image or video above.'}
          </p>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 16,
            }}
          >
            {filteredMedia.map((item) => (
              <div
                key={item.id}
                style={{
                  background: '#fff',
                  border: '0.5px solid #DEDBD4',
                  borderRadius: 4,
                  overflow: 'hidden',
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
                        top: 8,
                        left: 8,
                        background: 'rgba(13,13,13,0.6)',
                        color: '#F8F8F6',
                        fontSize: 11,
                        padding: '2px 8px',
                        borderRadius: 2,
                        letterSpacing: '0.1em',
                      }}
                    >
                      VIDEO
                    </span>
                  )}
                </div>
                <div style={{ padding: 12 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      marginBottom: 4,
                      wordBreak: 'break-all',
                    }}
                    title={item.filename}
                  >
                    {item.filename}
                  </div>
                  <div style={{ fontSize: 12, color: '#9C9890', marginBottom: 8 }}>
                    {item.width && item.height ? `${item.width}×${item.height}` : ''}
                    {item.duration ? ` · ${item.duration}s` : ''}
                  </div>
                  <button
                    onClick={() => handleDelete(item.id)}
                    style={{
                      fontSize: 11,
                      letterSpacing: '0.1em',
                      color: '#B3434A',
                      background: 'none',
                      border: '1px solid #DEDBD4',
                      borderRadius: 2,
                      padding: '6px 12px',
                      cursor: 'pointer',
                      width: '100%',
                      fontFamily: 'inherit',
                    }}
                  >
                    DELETE
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
