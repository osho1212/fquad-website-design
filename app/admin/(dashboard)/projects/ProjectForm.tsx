'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MediaPicker, { thumbFor, type MediaItem } from '../components/MediaPicker';
import LocationPicker from '../components/LocationPicker';

interface Category {
  id: string;
  name: string;
}

interface MainCategory {
  id: string;
  name: string;
  slug: string;
}

interface ProjectOption {
  id: string;
  title: string;
  mainCategory: { slug: string } | null;
}

interface GalleryEntry {
  id: string;
  media: MediaItem;
  areaLabel: string;
}

interface TestimonialValue {
  clientName: string;
  clientAddress: string;
  testimonialText: string;
  media: MediaItem | null;
}

const emptyTestimonial: TestimonialValue = {
  clientName: '',
  clientAddress: '',
  testimonialText: '',
  media: null,
};

export interface ProjectFormValue {
  id?: string;
  title: string;
  categoryId: string;
  mainCategoryId: string;
  subCategory: string;
  location: string;
  year: string;
  clientName: string;
  clientAddress: string;
  shortDescription: string;
  description: string;
  coverMedia: MediaItem | null;
  gallery: GalleryEntry[];
  hasInteriors: boolean;
  hasArchitecture: boolean;
  linkedProjectId: string;
  featured: boolean;
  upcoming: boolean;
  published: boolean;
}

const emptyValue: ProjectFormValue = {
  title: '',
  categoryId: '',
  mainCategoryId: '',
  subCategory: '',
  location: '',
  year: '',
  clientName: '',
  clientAddress: '',
  shortDescription: '',
  description: '',
  coverMedia: null,
  gallery: [],
  hasInteriors: false,
  hasArchitecture: false,
  linkedProjectId: '',
  featured: false,
  upcoming: false,
  published: true,
};

export default function ProjectForm({ projectId }: { projectId?: string }) {
  const router = useRouter();
  const isEditing = !!projectId;

  const [categories, setCategories] = useState<Category[]>([]);
  const [mainCategories, setMainCategories] = useState<MainCategory[]>([]);
  const [allProjects, setAllProjects] = useState<ProjectOption[]>([]);
  const [value, setValue] = useState<ProjectFormValue>(emptyValue);
  const [testimonialEnabled, setTestimonialEnabled] = useState(false);
  const [testimonial, setTestimonial] = useState<TestimonialValue>(emptyTestimonial);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [pickerTarget, setPickerTarget] = useState<'cover' | 'gallery' | 'testimonial' | null>(null);
  const [dragGalleryId, setDragGalleryId] = useState<string | null>(null);
  const [mapLat, setMapLat] = useState<number | null>(null);
  const [mapLng, setMapLng] = useState<number | null>(null);
  const [showLocation, setShowLocation] = useState(false);

  useEffect(() => {
    fetch('/api/admin/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []));
    fetch('/api/admin/main-categories')
      .then((res) => res.json())
      .then((data) => setMainCategories(data.mainCategories || []));
    fetch('/api/admin/projects')
      .then((res) => res.json())
      .then((data) => setAllProjects(data.projects || []));
  }, []);

  // The old flat Category tag is no longer shown in the UI, but categoryId is
  // still a required DB field — auto-assign the first one behind the scenes
  // so project creation keeps working without a visible legacy picker.
  useEffect(() => {
    if (!value.categoryId && categories.length > 0) {
      setValue((prev) => (prev.categoryId ? prev : { ...prev, categoryId: categories[0].id }));
    }
  }, [categories, value.categoryId]);

  useEffect(() => {
    if (!projectId) return;
    fetch(`/api/admin/projects/${projectId}`)
      .then((res) => res.json())
      .then((data) => {
        const p = data.project;
        if (!p) return;
        setValue({
          id: p.id,
          title: p.title,
          categoryId: p.categoryId,
          mainCategoryId: p.mainCategoryId || '',
          subCategory: p.subCategory || '',
          location: p.location || '',
          year: p.year ? String(p.year) : '',
          clientName: p.clientName || '',
          clientAddress: p.clientAddress || '',
          shortDescription: p.shortDescription || '',
          description: p.description || '',
          coverMedia: p.coverMedia || null,
          gallery: p.gallery.map((g: any) => ({ id: g.id, media: g.media, areaLabel: g.areaLabel || '' })),
          hasInteriors: !!p.hasInteriors,
          hasArchitecture: !!p.hasArchitecture,
          linkedProjectId: p.linkedProjectId || '',
          featured: p.featured,
          upcoming: p.status === 'UPCOMING',
          published: p.published,
        });
        setMapLat(p.mapLat ?? null);
        setMapLng(p.mapLng ?? null);
        setShowLocation(p.showLocation ?? false);
        if (p.testimonials && p.testimonials.length > 0) {
          const t = p.testimonials[0];
          setTestimonialEnabled(true);
          setTestimonial({
            clientName: t.clientName || '',
            clientAddress: t.clientAddress || '',
            testimonialText: t.testimonialText || '',
            media: t.media || null,
          });
        }
      })
      .finally(() => setLoading(false));
  }, [projectId]);

  function update<K extends keyof ProjectFormValue>(key: K, val: ProjectFormValue[K]) {
    setValue((prev) => ({ ...prev, [key]: val }));
  }

  function updateTestimonial<K extends keyof TestimonialValue>(key: K, val: TestimonialValue[K]) {
    setTestimonial((prev) => ({ ...prev, [key]: val }));
  }

  function handleMediaSelected(item: MediaItem) {
    if (pickerTarget === 'cover') {
      update('coverMedia', item);
    } else if (pickerTarget === 'gallery') {
      setValue((prev) => ({
        ...prev,
        gallery: [...prev.gallery, { id: `temp-${item.id}-${Date.now()}`, media: item, areaLabel: '' }],
      }));
    } else if (pickerTarget === 'testimonial') {
      updateTestimonial('media', item);
    }
    setPickerTarget(null);
  }

  function removeGalleryItem(id: string) {
    setValue((prev) => ({ ...prev, gallery: prev.gallery.filter((g) => g.id !== id) }));
  }

  function updateGalleryAreaLabel(id: string, areaLabel: string) {
    setValue((prev) => ({
      ...prev,
      gallery: prev.gallery.map((g) => (g.id === id ? { ...g, areaLabel } : g)),
    }));
  }

  function handleGalleryDragOver(e: React.DragEvent, overId: string) {
    e.preventDefault();
    if (!dragGalleryId || dragGalleryId === overId) return;
    setValue((prev) => {
      const items = [...prev.gallery];
      const dragIndex = items.findIndex((g) => g.id === dragGalleryId);
      const overIndex = items.findIndex((g) => g.id === overId);
      if (dragIndex === -1 || overIndex === -1) return prev;
      const [moved] = items.splice(dragIndex, 1);
      items.splice(overIndex, 0, moved);
      return { ...prev, gallery: items };
    });
  }

  async function handleSave() {
    setError('');

    if (!value.title.trim()) {
      setError('Title is required.');
      return;
    }
    if (!value.mainCategoryId) {
      setError('Please choose Architecture or Interiors.');
      return;
    }

    setSaving(true);

    const payload = {
      title: value.title.trim(),
      categoryId: value.categoryId,
      mainCategoryId: value.mainCategoryId,
      subCategory: value.subCategory || null,
      location: value.location.trim() || null,
      mapLat,
      mapLng,
      showLocation,
      year: value.year ? Number(value.year) : null,
      clientName: value.clientName.trim() || null,
      clientAddress: value.clientAddress.trim() || null,
      shortDescription: value.shortDescription.trim() || null,
      description: value.description.trim() || null,
      coverMediaId: value.coverMedia?.id || null,
      galleryItems: value.gallery.map((g, i) => ({
        mediaId: g.media.id,
        areaLabel: g.areaLabel.trim() || null,
        order: i,
      })),
      hasInteriors: value.hasInteriors,
      hasArchitecture: value.hasArchitecture,
      linkedProjectId: value.linkedProjectId || null,
      testimonial: testimonialEnabled && testimonial.testimonialText.trim()
        ? {
            clientName: testimonial.clientName.trim(),
            clientAddress: testimonial.clientAddress.trim() || null,
            testimonialText: testimonial.testimonialText.trim(),
            mediaId: testimonial.media?.id || null,
          }
        : null,
      featured: value.featured,
      status: value.upcoming ? 'UPCOMING' : 'PUBLISHED',
      published: value.published,
    };
    try {
      const res = await fetch(isEditing ? `/api/admin/projects/${projectId}` : '/api/admin/projects', {
        method: isEditing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Save failed.');
      } else {
        router.push('/admin/projects');
        router.refresh();
      }
    } catch {
      setError('Save failed — check your connection and try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!projectId) return;
    if (!confirm(`Delete "${value.title}"? This cannot be undone.`)) return;

    const res = await fetch(`/api/admin/projects/${projectId}`, { method: 'DELETE' });
    if (res.ok) {
      router.push('/admin/projects');
      router.refresh();
    } else {
      alert('Delete failed.');
    }
  }

  if (loading) {
    return <p style={{ color: '#9C9890' }}>Loading…</p>;
  }

  const selectedMainSlug = mainCategories.find((c) => c.id === value.mainCategoryId)?.slug || '';
  const companionProjects = allProjects.filter((p) => {
    if (p.id === projectId) return false;
    if (selectedMainSlug === 'architecture') return p.mainCategory?.slug === 'interiors';
    if (selectedMainSlug === 'interiors') return p.mainCategory?.slug === 'architecture';
    return false;
  });

  return (
    <div style={{ maxWidth: 720 }}>
      <h1 style={{ fontSize: 28, marginBottom: 24 }}>{isEditing ? 'Edit Project' : 'New Project'}</h1>

      {error && (
        <p style={{ color: '#B3434A', fontSize: 14, marginBottom: 16, background: '#fff', padding: 12, borderRadius: 2, border: '1px solid #B3434A' }}>
          {error}
        </p>
      )}

      <Field label="TITLE">
        <input
          type="text"
          value={value.title}
          onChange={(e) => update('title', e.target.value)}
          style={inputStyle}
          placeholder="The Pebble House"
        />
      </Field>

      <style>{categoryButtonHoverStyle}</style>

      <Field label="MAIN CATEGORY">
        <div style={{ display: 'flex', gap: 16 }}>
          {mainCategories.map((c) => {
            const selected = value.mainCategoryId === c.id;
            const icon = c.slug === 'architecture' ? '🏗' : c.slug === 'interiors' ? '🛋' : '';
            return (
              <button
                key={c.id}
                type="button"
                className="category-btn"
                onClick={() => update('mainCategoryId', c.id)}
                style={{ ...categoryButtonStyle, borderColor: selected ? '#2C2C2C' : '#E2DDD8', background: selected ? '#2C2C2C' : '#FAFAF8', color: selected ? '#F5F2EE' : '#2C2C2C' }}
              >
                {icon} {c.name}
              </button>
            );
          })}
        </div>
      </Field>

      <Field label="SUB CATEGORY">
        <div style={{ display: 'flex', gap: 16 }}>
          {['residential', 'commercial'].map((sub) => {
            const selected = value.subCategory === sub;
            return (
              <button
                key={sub}
                type="button"
                className="category-btn"
                onClick={() => update('subCategory', sub)}
                style={{ ...categoryButtonStyle, borderColor: selected ? '#2C2C2C' : '#E2DDD8', background: selected ? '#2C2C2C' : '#FAFAF8', color: selected ? '#F5F2EE' : '#2C2C2C' }}
              >
                {sub === 'residential' ? 'Residential' : 'Commercial'}
              </button>
            );
          })}
        </div>
      </Field>

      <Field label="YEAR">
        <input
          type="number"
          value={value.year}
          onChange={(e) => update('year', e.target.value)}
          style={{ ...inputStyle, maxWidth: 200 }}
          placeholder="2024"
        />
      </Field>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Field label="CLIENT NAME">
          <input
            type="text"
            value={value.clientName}
            onChange={(e) => update('clientName', e.target.value)}
            style={inputStyle}
            placeholder="Mr. & Mrs. Rao"
          />
        </Field>
        <Field label="CLIENT ADDRESS">
          <input
            type="text"
            value={value.clientAddress}
            onChange={(e) => update('clientAddress', e.target.value)}
            style={inputStyle}
            placeholder="Jubilee Hills, Hyderabad"
          />
        </Field>
      </div>

      <Field label={`SHORT DESCRIPTION (${value.shortDescription.length}/200)`}>
        <textarea
          value={value.shortDescription}
          onChange={(e) => update('shortDescription', e.target.value.slice(0, 200))}
          maxLength={200}
          style={{ ...inputStyle, minHeight: 70, resize: 'vertical', fontFamily: 'inherit' }}
          placeholder="One or two sentences for the projects list card."
        />
      </Field>

      <Field label="DESCRIPTION">
        <textarea
          value={value.description}
          onChange={(e) => update('description', e.target.value)}
          style={{ ...inputStyle, minHeight: 100, resize: 'vertical', fontFamily: 'inherit' }}
        />
      </Field>

      <Field label="LOCATION">
        <input
          type="text"
          value={value.location}
          onChange={(e) => update('location', e.target.value)}
          style={inputStyle}
          placeholder="Jubilee Hills, Hyderabad"
        />
      </Field>

      <Field label="MAP PIN">
        <LocationPicker
          lat={mapLat}
          lng={mapLng}
          onChange={(lat, lng, address) => {
            setMapLat(lat);
            setMapLng(lng);
            if (address) {
              update('location', address);
            }
          }}
        />
        <label style={{ ...checkboxLabelStyle, marginTop: 12 }}>
          <input type="checkbox" checked={showLocation} onChange={(e) => setShowLocation(e.target.checked)} />
          Show this location publicly on the Projects page
        </label>
        <p style={{ fontSize: 12, color: '#9C9890', marginTop: 6 }}>
          Leave unchecked for residential projects where the client prefers not to
          disclose the address.
        </p>
      </Field>

      {(selectedMainSlug === 'architecture' || selectedMainSlug === 'interiors') && (
        <Field label="COMPANION PROJECT">
          {selectedMainSlug === 'architecture' ? (
            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={value.hasInteriors}
                onChange={(e) => update('hasInteriors', e.target.checked)}
              />
              Interior design available for this project
            </label>
          ) : (
            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={value.hasArchitecture}
                onChange={(e) => update('hasArchitecture', e.target.checked)}
              />
              Architecture/Elevation available
            </label>
          )}

          {((selectedMainSlug === 'architecture' && value.hasInteriors) ||
            (selectedMainSlug === 'interiors' && value.hasArchitecture)) && (
            <select
              value={value.linkedProjectId}
              onChange={(e) => update('linkedProjectId', e.target.value)}
              style={{ ...inputStyle, marginTop: 12 }}
            >
              <option value="">
                {selectedMainSlug === 'architecture' ? 'Link to Interiors project…' : 'Link to Architecture project…'}
              </option>
              {companionProjects.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          )}
        </Field>
      )}

      <Field label="COVER IMAGE">
        {value.coverMedia ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 100, height: 75, borderRadius: 2, overflow: 'hidden', background: '#0D0D0D' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={thumbFor(value.coverMedia)}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <button onClick={() => setPickerTarget('cover')} style={smallButtonStyle}>
              CHANGE
            </button>
            <button onClick={() => update('coverMedia', null)} style={{ ...smallButtonStyle, color: '#B3434A' }}>
              REMOVE
            </button>
          </div>
        ) : (
          <button onClick={() => setPickerTarget('cover')} style={smallButtonStyle}>
            CHOOSE COVER IMAGE
          </button>
        )}
      </Field>

      <Field label="GALLERY">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
            gap: 10,
            marginBottom: 12,
          }}
        >
          {value.gallery.map((g) => (
            <div key={g.id}>
              <div
                draggable
                onDragStart={() => setDragGalleryId(g.id)}
                onDragOver={(e) => handleGalleryDragOver(e, g.id)}
                onDragEnd={() => setDragGalleryId(null)}
                style={{
                  position: 'relative',
                  aspectRatio: '4 / 3',
                  borderRadius: 2,
                  overflow: 'hidden',
                  background: '#0D0D0D',
                  cursor: 'grab',
                  opacity: dragGalleryId === g.id ? 0.5 : 1,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={thumbFor(g.media)}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <button
                  onClick={() => removeGalleryItem(g.id)}
                  style={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    border: 'none',
                    background: 'rgba(13,13,13,0.7)',
                    color: '#fff',
                    fontSize: 14,
                    lineHeight: 1,
                    cursor: 'pointer',
                  }}
                  aria-label="Remove"
                >
                  ×
                </button>
              </div>
              <input
                type="text"
                value={g.areaLabel}
                onChange={(e) => updateGalleryAreaLabel(g.id, e.target.value)}
                placeholder="Area label e.g. Living Room (max 40 chars)"
                maxLength={40}
                style={{ ...inputStyle, marginTop: 6, padding: '6px 8px', fontSize: 11 }}
              />
            </div>
          ))}
        </div>
        <button onClick={() => setPickerTarget('gallery')} style={smallButtonStyle}>
          + ADD GALLERY IMAGE
        </button>
        {value.gallery.length > 1 && (
          <p style={{ fontSize: 12, color: '#9C9890', marginTop: 8 }}>Drag thumbnails to reorder.</p>
        )}
      </Field>

      <Field label="TESTIMONIAL">
        <span
          onClick={() => setTestimonialEnabled((v) => !v)}
          style={{ fontSize: 12, color: '#8B7355', cursor: 'pointer', fontWeight: 600 }}
        >
          {testimonialEnabled ? '－ Remove Testimonial' : '＋ Add Testimonial'}
        </span>

        {testimonialEnabled && (
          <div style={{ marginTop: 16, padding: 16, background: '#fff', border: '0.5px solid #DEDBD4', borderRadius: 4 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="CLIENT NAME">
                <input
                  type="text"
                  value={testimonial.clientName}
                  onChange={(e) => updateTestimonial('clientName', e.target.value)}
                  style={inputStyle}
                />
              </Field>
              <Field label="CLIENT ADDRESS">
                <input
                  type="text"
                  value={testimonial.clientAddress}
                  onChange={(e) => updateTestimonial('clientAddress', e.target.value)}
                  style={inputStyle}
                />
              </Field>
            </div>
            <Field label="TESTIMONIAL TEXT">
              <textarea
                value={testimonial.testimonialText}
                onChange={(e) => updateTestimonial('testimonialText', e.target.value)}
                rows={4}
                style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
              />
            </Field>
            <Field label="CLIENT PHOTO / LOGO">
              {testimonial.media ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', overflow: 'hidden', background: '#0D0D0D' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={thumbFor(testimonial.media)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <button onClick={() => setPickerTarget('testimonial')} style={smallButtonStyle}>CHANGE</button>
                  <button onClick={() => updateTestimonial('media', null)} style={{ ...smallButtonStyle, color: '#B3434A' }}>REMOVE</button>
                </div>
              ) : (
                <button onClick={() => setPickerTarget('testimonial')} style={smallButtonStyle}>CHOOSE PHOTO</button>
              )}
              <p style={{ fontSize: 11, color: '#9C9890', marginTop: 8 }}>JPEG and PNG accepted — client photo or brand logo</p>
            </Field>
          </div>
        )}
      </Field>

      <div style={{ display: 'flex', gap: 24, margin: '24px 0', flexWrap: 'wrap' }}>
        <label style={checkboxLabelStyle}>
          <input type="checkbox" checked={value.featured} onChange={(e) => update('featured', e.target.checked)} />
          Featured on homepage
        </label>
        <label style={checkboxLabelStyle}>
          <input type="checkbox" checked={value.upcoming} onChange={(e) => update('upcoming', e.target.checked)} />
          Show as upcoming
        </label>
        <label style={checkboxLabelStyle}>
          <input type="checkbox" checked={value.published} onChange={(e) => update('published', e.target.checked)} />
          Published
        </label>
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
        <button onClick={handleSave} disabled={saving} style={primaryButtonStyle}>
          {saving ? 'SAVING…' : isEditing ? 'SAVE CHANGES' : 'CREATE PROJECT'}
        </button>
        <button onClick={() => router.push('/admin/projects')} style={secondaryButtonStyle}>
          CANCEL
        </button>
        {isEditing && (
          <button onClick={handleDelete} style={{ ...secondaryButtonStyle, color: '#B3434A', marginLeft: 'auto' }}>
            DELETE PROJECT
          </button>
        )}
      </div>

      <MediaPicker
        open={pickerTarget !== null}
        onClose={() => setPickerTarget(null)}
        onSelect={handleMediaSelected}
        accept="image"
      />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: 'block', fontSize: 12, letterSpacing: '0.12em', color: '#7A7870', fontWeight: 600, marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 14px',
  border: '1px solid #DEDBD4',
  borderRadius: 2,
  fontSize: 15,
  fontFamily: 'inherit',
  background: '#fff',
  color: '#0D0D0D',
  outline: 'none',
};

const smallButtonStyle: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: '0.1em',
  color: '#0D0D0D',
  background: 'none',
  border: '1px solid #DEDBD4',
  borderRadius: 2,
  padding: '9px 16px',
  cursor: 'pointer',
  fontWeight: 600,
  fontFamily: 'inherit',
};

const primaryButtonStyle: React.CSSProperties = {
  padding: '13px 28px',
  background: '#0D0D0D',
  color: '#F8F8F6',
  border: 'none',
  borderRadius: 2,
  fontSize: 12,
  letterSpacing: '0.14em',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'inherit',
};

const secondaryButtonStyle: React.CSSProperties = {
  padding: '13px 28px',
  background: 'transparent',
  color: '#0D0D0D',
  border: '1px solid #DEDBD4',
  borderRadius: 2,
  fontSize: 12,
  letterSpacing: '0.14em',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'inherit',
};

const checkboxLabelStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  fontSize: 14,
  color: '#0D0D0D',
  cursor: 'pointer',
};

const categoryButtonStyle: React.CSSProperties = {
  width: 'calc(50% - 8px)',
  padding: '14px 0',
  border: '1px solid #E2DDD8',
  borderRadius: 2,
  fontFamily: 'inherit',
  fontSize: 13,
  letterSpacing: '0.1em',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
};

const categoryButtonHoverStyle = `
  .category-btn:hover { border-color: #2C2C2C; }
`;
