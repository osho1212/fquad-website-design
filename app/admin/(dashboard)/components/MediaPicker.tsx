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
  folderId?: string | null;
}

export interface Folder {
  id: string;
  name: string;
  createdAt?: string;
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
  onSelectMultiple?: (items: MediaItem[]) => void;
  multiple?: boolean;
  /** Restrict to images only (e.g. for cover/gallery) or allow video too */
  accept?: 'image' | 'all';
  /** Uploads made through this picker skip the watermark (e.g. hero slide backgrounds) */
  background?: boolean;
}

export default function MediaPicker({
  open,
  onClose,
  onSelect,
  onSelectMultiple,
  multiple = false,
  accept = 'all',
  background = false,
}: MediaPickerProps) {
  const [tab, setTab] = useState<'library' | 'upload'>('library');
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [uploadFolder, setUploadFolder] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<MediaItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      loadMedia();
      loadFolders();
      setTab('library');
      setError('');
      setSearchQuery('');
      setSelectedItems([]);
      setUploadProgress({ current: 0, total: 0 });
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

  async function loadFolders() {
    try {
      const res = await fetch('/api/admin/media-folders');
      const data = await res.json();
      setFolders(data.folders || []);
    } catch {
      // ignore
    }
  }

  function handleSelectFolder(folderId: string | null) {
    setSelectedFolder(folderId);
    setUploadFolder(folderId || '');
  }

  function toggleItemSelection(item: MediaItem) {
    if (!multiple) {
      onSelect(item);
      onClose();
      return;
    }

    setSelectedItems((prev) => {
      const exists = prev.some((x) => x.id === item.id);
      if (exists) {
        return prev.filter((x) => x.id !== item.id);
      } else {
        return [...prev, item];
      }
    });
  }

  function handleConfirmMultiSelect() {
    if (selectedItems.length === 0) return;
    if (onSelectMultiple) {
      onSelectMultiple(selectedItems);
    } else {
      onSelect(selectedItems[0]);
    }
    onClose();
  }

  function handleSelectAllVisible(visibleItems: MediaItem[]) {
    if (selectedItems.length === visibleItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(visibleItems);
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    setError('');
    setUploadProgress({ current: 0, total: files.length });

    const targetFolder = uploadFolder || selectedFolder || '';
    const uploadedMediaList: MediaItem[] = [];

    for (let i = 0; i < files.length; i++) {
      setUploadProgress({ current: i + 1, total: files.length });

      const formData = new FormData();
      formData.append('file', files[i]);
      if (targetFolder) {
        formData.append('folderId', targetFolder);
      }

      try {
        const res = await fetch(`/api/admin/media${background ? '?bg=1' : ''}`, { method: 'POST', body: formData });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || `Upload failed for ${files[i].name}.`);
        } else {
          uploadedMediaList.push(data.media);
        }
      } catch {
        setError(`Upload failed for ${files[i].name} — check your connection and try again.`);
      }
    }

    setUploading(false);
    setUploadProgress({ current: 0, total: 0 });
    if (fileInputRef.current) fileInputRef.current.value = '';

    if (uploadedMediaList.length > 0) {
      if (multiple && onSelectMultiple) {
        onSelectMultiple(uploadedMediaList);
        onClose();
      } else {
        onSelect(uploadedMediaList[0]);
        onClose();
      }
    }
  }

  if (!open) return null;

  // Filter media by accept type, folder, and search query
  const typeFiltered = accept === 'image' ? media.filter((m) => m.type === 'IMAGE') : media;
  const folderFiltered =
    selectedFolder === null
      ? typeFiltered
      : typeFiltered.filter((m) => m.folderId === selectedFolder);
  const searchFiltered = searchQuery.trim()
    ? folderFiltered.filter((m) =>
        m.filename.toLowerCase().includes(searchQuery.toLowerCase().trim())
      )
    : folderFiltered;

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
          maxWidth: 900,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
        }}
      >
        {/* Header Tabs */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '14px 20px',
            borderBottom: '0.5px solid #DEDBD4',
            background: '#FFFFFF',
          }}
        >
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
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
              UPLOAD NEW {multiple ? '(MULTIPLE)' : ''}
            </button>
            {multiple && (
              <span
                style={{
                  fontSize: 11,
                  background: '#E8E5DE',
                  color: '#555',
                  padding: '3px 8px',
                  borderRadius: 12,
                  letterSpacing: '0.04em',
                  fontWeight: 600,
                  marginLeft: 8,
                }}
              >
                MULTI-SELECT MODE
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#7A7870', lineHeight: 1 }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Sub-header: Folder Filter & Search (when on library tab) */}
        {tab === 'library' && (
          <div
            style={{
              padding: '12px 20px',
              background: '#F4F2EB',
              borderBottom: '0.5px solid #DEDBD4',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 10,
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {/* Folder Pills */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => handleSelectFolder(null)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: selectedFolder === null ? 600 : 400,
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: selectedFolder === null ? '#0D0D0D' : '#DEDBD4',
                  background: selectedFolder === null ? '#0D0D0D' : '#FFFFFF',
                  color: selectedFolder === null ? '#FFFFFF' : '#333333',
                  transition: 'all 0.15s ease',
                  fontFamily: 'inherit',
                }}
              >
                All Media ({typeFiltered.length})
              </button>

              {folders.map((f) => {
                const count = typeFiltered.filter((m) => m.folderId === f.id).length;
                const isSelected = selectedFolder === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => handleSelectFolder(f.id)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: isSelected ? 600 : 400,
                      cursor: 'pointer',
                      border: '1px solid',
                      borderColor: isSelected ? '#0D0D0D' : '#DEDBD4',
                      background: isSelected ? '#0D0D0D' : '#FFFFFF',
                      color: isSelected ? '#FFFFFF' : '#333333',
                      transition: 'all 0.15s ease',
                      fontFamily: 'inherit',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <span>📁</span> {f.name} ({count})
                  </button>
                );
              })}
            </div>

            {/* Search & Actions */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {multiple && searchFiltered.length > 0 && (
                <button
                  type="button"
                  onClick={() => handleSelectAllVisible(searchFiltered)}
                  style={{
                    padding: '5px 10px',
                    borderRadius: 4,
                    fontSize: 11,
                    border: '1px solid #DEDBD4',
                    background: '#FFFFFF',
                    color: '#333',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontWeight: 500,
                  }}
                >
                  {selectedItems.length === searchFiltered.length ? 'Deselect all' : 'Select all visible'}
                </button>
              )}

              <input
                type="text"
                placeholder="Search filename…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  padding: '5px 10px',
                  borderRadius: 4,
                  border: '1px solid #DEDBD4',
                  fontSize: 12,
                  fontFamily: 'inherit',
                  background: '#FFFFFF',
                  maxWidth: 160,
                }}
              />
            </div>
          </div>
        )}

        {/* Content Area */}
        <div style={{ padding: 20, overflowY: 'auto', flex: 1 }}>
          {error && <p style={{ color: '#B3434A', fontSize: 14, marginBottom: 16 }}>{error}</p>}

          {tab === 'upload' ? (
            <div style={{ maxWidth: 460, margin: '30px auto', textAlign: 'center' }}>
              {folders.length > 0 && (
                <div style={{ marginBottom: 20, textAlign: 'left' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#5A5852',
                      marginBottom: 6,
                      letterSpacing: '0.04em',
                    }}
                  >
                    DESTINATION FOLDER:
                  </label>
                  <select
                    value={uploadFolder}
                    onChange={(e) => setUploadFolder(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #DEDBD4',
                      borderRadius: 2,
                      fontSize: 13,
                      fontFamily: 'inherit',
                      background: '#FFFFFF',
                    }}
                  >
                    <option value="">📁 No folder (All Media)</option>
                    {folders.map((f) => (
                      <option key={f.id} value={f.id}>
                        📁 {f.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {uploading && (
                <div style={{ marginBottom: 24, textAlign: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#0D0D0D' }}>
                    UPLOADING & WATERMARKING {uploadProgress.current} OF {uploadProgress.total}…
                  </div>
                  <div
                    style={{
                      width: '100%',
                      height: 4,
                      background: '#DEDBD4',
                      borderRadius: 2,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${(uploadProgress.current / Math.max(1, uploadProgress.total)) * 100}%`,
                        background: '#0D0D0D',
                        transition: 'width 0.2s ease',
                      }}
                    />
                  </div>
                </div>
              )}

              <div style={{ marginTop: 20 }}>
                <label
                  style={{
                    display: 'inline-block',
                    padding: '14px 30px',
                    background: uploading ? '#9C9890' : '#0D0D0D',
                    color: '#F8F8F6',
                    borderRadius: 2,
                    fontSize: 12,
                    letterSpacing: '0.14em',
                    fontWeight: 600,
                    cursor: uploading ? 'default' : 'pointer',
                  }}
                >
                  {uploading
                    ? `PROCESSING ${uploadProgress.current}/${uploadProgress.total}…`
                    : multiple
                    ? 'CHOOSE IMAGE(S)'
                    : 'CHOOSE FILE'}
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple={multiple}
                    accept={accept === 'image' ? 'image/*' : 'image/*,video/*'}
                    onChange={handleUpload}
                    disabled={uploading}
                    style={{ display: 'none' }}
                  />
                </label>
                <p style={{ color: '#7A7870', fontSize: 13, marginTop: 14, lineHeight: 1.5 }}>
                  {multiple
                    ? 'Select 1 or more images from your computer. They will be uploaded into the selected folder and added directly to the project gallery in one go.'
                    : 'Uploading here saves the image into your selected folder and selects it immediately.'}
                </p>
              </div>
            </div>
          ) : loading ? (
            <p style={{ color: '#9C9890', padding: 20 }}>Loading media…</p>
          ) : searchFiltered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9C9890' }}>
              <p style={{ fontSize: 15, marginBottom: 8 }}>
                {selectedFolder
                  ? `No media found in "${folders.find((f) => f.id === selectedFolder)?.name || 'this folder'}".`
                  : 'No media found.'}
              </p>
              <p style={{ fontSize: 13 }}>
                Switch to the <strong>"Upload New"</strong> tab above to add images directly into this folder.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(145px, 1fr))',
                gap: 14,
              }}
            >
              {searchFiltered.map((item) => {
                const isSelected = selectedItems.some((x) => x.id === item.id);
                const selectedIndex = selectedItems.findIndex((x) => x.id === item.id);

                return (
                  <div
                    key={item.id}
                    onClick={() => toggleItemSelection(item)}
                    style={{
                      border: isSelected ? '2px solid #0D0D0D' : '1px solid #DEDBD4',
                      borderRadius: 4,
                      overflow: 'hidden',
                      background: '#FFFFFF',
                      cursor: 'pointer',
                      padding: 0,
                      textAlign: 'left',
                      position: 'relative',
                      transform: isSelected ? 'translateY(-2px)' : 'none',
                      boxShadow: isSelected ? '0 6px 16px rgba(0,0,0,0.15)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ aspectRatio: '4 / 3', background: '#1A1A1A', position: 'relative' }}>
                      {thumbFor(item) && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={thumbFor(item)}
                          alt={item.alt || item.filename}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            opacity: isSelected ? 0.92 : 1,
                          }}
                        />
                      )}

                      {/* Selection Checkmark / Index Badge */}
                      {multiple && (
                        <div
                          style={{
                            position: 'absolute',
                            top: 6,
                            right: 6,
                            width: 22,
                            height: 22,
                            borderRadius: '50%',
                            background: isSelected ? '#0D0D0D' : 'rgba(255,255,255,0.85)',
                            border: isSelected ? '2px solid #FFFFFF' : '1px solid #999',
                            color: isSelected ? '#FFFFFF' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 10,
                            fontWeight: 700,
                            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                          }}
                        >
                          {isSelected ? `${selectedIndex + 1}` : ''}
                        </div>
                      )}

                      {item.type === 'VIDEO' && (
                        <span
                          style={{
                            position: 'absolute',
                            top: 6,
                            left: 6,
                            background: 'rgba(13,13,13,0.7)',
                            color: '#F8F8F6',
                            fontSize: 9,
                            padding: '2px 6px',
                            borderRadius: 2,
                            letterSpacing: '0.08em',
                          }}
                        >
                          VIDEO
                        </span>
                      )}
                    </div>

                    <div style={{ padding: '8px 10px' }}>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: isSelected ? 700 : 600,
                          color: '#0D0D0D',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          marginBottom: 2,
                        }}
                        title={item.filename}
                      >
                        {item.filename}
                      </div>
                      <div style={{ fontSize: 10, color: '#9C9890' }}>
                        {item.width && item.height ? `${item.width}×${item.height}` : ''}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer for Multi-Select Confirmation */}
        {multiple && tab === 'library' && (
          <div
            style={{
              padding: '14px 20px',
              borderTop: '0.5px solid #DEDBD4',
              background: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ fontSize: 13, color: '#555' }}>
              {selectedItems.length === 0 ? (
                <span>Click on images to select them</span>
              ) : (
                <span style={{ fontWeight: 600, color: '#0D0D0D' }}>
                  ✓ {selectedItems.length} {selectedItems.length === 1 ? 'image' : 'images'} selected
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              {selectedItems.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedItems([])}
                  style={{
                    padding: '8px 14px',
                    fontSize: 12,
                    border: '1px solid #DEDBD4',
                    background: 'none',
                    borderRadius: 2,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    color: '#666',
                  }}
                >
                  Clear Selection
                </button>
              )}

              <button
                type="button"
                onClick={handleConfirmMultiSelect}
                disabled={selectedItems.length === 0}
                style={{
                  padding: '10px 22px',
                  fontSize: 12,
                  letterSpacing: '0.1em',
                  fontWeight: 600,
                  border: 'none',
                  borderRadius: 2,
                  cursor: selectedItems.length === 0 ? 'not-allowed' : 'pointer',
                  background: selectedItems.length === 0 ? '#C4C2BC' : '#0D0D0D',
                  color: '#FFFFFF',
                  fontFamily: 'inherit',
                  transition: 'background 0.15s ease',
                }}
              >
                ADD {selectedItems.length > 0 ? `${selectedItems.length} ` : ''}IMAGE
                {selectedItems.length === 1 ? '' : 'S'} TO GALLERY →
              </button>
            </div>
          </div>
        )}
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