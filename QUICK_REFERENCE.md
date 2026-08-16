# Quick Reference - Copy-Paste Patterns

Use these patterns when building new pages. Just copy and customize!

---

## Page Template (Full)

```typescript
// app/pagename/page.tsx

import Navigation from '@/app/components/Navigation';
import Footer from '@/app/components/Footer';
import { colors, typography, spacing } from '@/lib/design-tokens';

export default function PageName() {
  return (
    <main style={{ backgroundColor: colors.white }}>
      <Navigation />
      
      {/* Your content here */}

      <Footer />
    </main>
  );
}
```

---

## Common Sections

### Hero Section (Dark)
```typescript
<section style={{
  backgroundColor: colors.bg_dark,
  padding: `${spacing.xxl} ${spacing.page_margin_desktop}`,
  minHeight: '400px',
  display: 'flex',
  alignItems: 'center',
}}>
  <h1 style={{ fontSize: typography.h1, color: colors.white }}>
    Your Heading
  </h1>
</section>
```

### Hero Section (Light)
```typescript
<section style={{
  backgroundColor: colors.grey_bg,
  padding: `${spacing.xxl} ${spacing.page_margin_desktop}`,
}}>
  <h1 style={{ fontSize: typography.h1, color: colors.black }}>
    Your Heading
  </h1>
</section>
```

### Standard Section
```typescript
<section style={{
  padding: `${spacing.xxl} ${spacing.page_margin_desktop}`,
  maxWidth: '1920px',
  margin: '0 auto',
}}>
  <h2 style={{ fontSize: typography.h2, color: colors.black, marginBottom: spacing.lg }}>
    Section Title
  </h2>
  
  {/* Content */}
</section>
```

### Two-Column Grid
```typescript
<div style={{
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: spacing.xxl,
  alignItems: 'start',
}}>
  <div>{/* Left column */}</div>
  <div>{/* Right column */}</div>
</div>
```

### Three-Column Grid
```typescript
<div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: spacing.xl,
}}>
  <div>{/* Card 1 */}</div>
  <div>{/* Card 2 */}</div>
  <div>{/* Card 3 */}</div>
</div>
```

---

## Common Elements

### Heading with Gold Line
```typescript
<div>
  <h2 style={{ fontSize: typography.h2, color: colors.black, marginBottom: spacing.sm }}>
    Section Title
  </h2>
  <div style={{
    width: '60px',
    height: '2px',
    backgroundColor: colors.gold,
    marginBottom: spacing.xxl,
  }}></div>
</div>
```

### Text with Icon
```typescript
<div style={{ display: 'flex', gap: spacing.lg }}>
  <Icon style={{ width: '24px', height: '24px', color: colors.gold, flexShrink: 0 }} />
  <div>
    <p style={{ fontSize: typography.body_sm, color: colors.grey_light }}>LABEL</p>
    <p style={{ fontSize: typography.body_lg, color: colors.black }}>Content</p>
  </div>
</div>
```

### Button (Dark)
```typescript
<button style={{
  padding: `${spacing.md} ${spacing.lg}`,
  backgroundColor: colors.black,
  color: colors.white,
  border: 'none',
  fontSize: typography.body_sm,
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
}}
  onMouseEnter={(e) => {
    (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
    (e.currentTarget as HTMLElement).style.border = `0.5px solid ${colors.black}`;
    (e.currentTarget as HTMLElement).style.color = colors.black;
  }}
  onMouseLeave={(e) => {
    (e.currentTarget as HTMLElement).style.backgroundColor = colors.black;
    (e.currentTarget as HTMLElement).style.border = 'none';
    (e.currentTarget as HTMLElement).style.color = colors.white;
  }}
>
  BUTTON TEXT
</button>
```

### Button (Gold)
```typescript
<button style={{
  padding: `${spacing.md} ${spacing.lg}`,
  backgroundColor: colors.gold,
  color: colors.black,
  border: 'none',
  fontSize: typography.body_sm,
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
}}
  onMouseEnter={(e) => {
    (e.currentTarget as HTMLElement).style.backgroundColor = colors.gold_dark;
  }}
  onMouseLeave={(e) => {
    (e.currentTarget as HTMLElement).style.backgroundColor = colors.gold;
  }}
>
  BUTTON TEXT
</button>
```

### Card
```typescript
<div style={{
  backgroundColor: colors.white,
  border: `0.5px solid ${colors.border}`,
  padding: spacing.xl,
  borderRadius: '4px',
}}>
  <h3 style={{ fontSize: typography.h4, color: colors.black, marginBottom: spacing.md }}>
    Card Title
  </h3>
  <p style={{ fontSize: typography.body, color: colors.grey_dark, lineHeight: 1.7 }}>
    Card description
  </p>
</div>
```

### Image with Overlay
```typescript
<div style={{
  position: 'relative',
  overflow: 'hidden',
  height: '300px',
  backgroundColor: colors.bg_dark,
}}>
  <img
    src="image.jpg"
    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
  />
  <div style={{
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
  }}></div>
</div>
```

---

## Colors Cheat Sheet

```typescript
// Text colors
color: colors.black        // Dark text on light backgrounds
color: colors.grey_dark    // Secondary text
color: colors.grey_light   // Muted text
color: colors.white        // Text on dark backgrounds

// Background colors
backgroundColor: colors.white      // Light sections
backgroundColor: colors.grey_bg    // Light grey sections
backgroundColor: colors.bg_dark    // Dark sections (#141414)
backgroundColor: colors.bg_darker  // Darkest sections (#0D0D0D - footers)

// Accent colors
color: colors.gold         // Links, hovers
backgroundColor: colors.gold // CTA buttons

// Borders
border: `0.5px solid ${colors.border}`
```

---

## Typography Cheat Sheet

```typescript
// Headings
fontSize: typography.h1     // 52px - Page titles
fontSize: typography.h2     // 40px - Section headers
fontSize: typography.h3     // 32px - Sub-headers
fontSize: typography.h4     // 24px - Card titles

// Body text
fontSize: typography.body_lg   // 18px - Large text
fontSize: typography.body      // 16px - Normal text (DEFAULT)
fontSize: typography.body_sm   // 14px - Small text

// Labels
fontSize: typography.label     // 12px
fontSize: typography.eyebrow   // 11px
```

---

## Spacing Cheat Sheet

```typescript
// Horizontal padding (page margins)
padding: `... ${spacing.page_margin_desktop} ...`    // 48px (desktop)
padding: `... ${spacing.page_margin_tablet} ...`     // 32px (tablet)
padding: `... ${spacing.page_margin_mobile} ...`     // 20px (mobile)

// Vertical spacing
padding: `${spacing.xxl} ...`    // 48px vertical
padding: `${spacing.xl} ...`     // 32px vertical
padding: `${spacing.lg} ...`     // 24px vertical
marginBottom: spacing.xxl        // 48px gap below element
marginBottom: spacing.xl         // 32px gap below element
marginBottom: spacing.lg         // 24px gap below element

// Gap between items
gap: spacing.xxl  // 48px
gap: spacing.xl   // 32px
gap: spacing.lg   // 24px
gap: spacing.md   // 16px
```

---

## Responsive Example (Desktop → Mobile)

```typescript
<div style={{
  display: 'grid',
  gridTemplateColumns: window.innerWidth > 1024 ? '1fr 1fr' : '1fr',
  gap: spacing.xl,
  padding: `${spacing.xxl} ${
    window.innerWidth > 1024 
      ? spacing.page_margin_desktop 
      : window.innerWidth > 640
        ? spacing.page_margin_tablet
        : spacing.page_margin_mobile
  }`,
}}>
  {/* Content */}
</div>
```

Or use CSS Media Queries (better approach):

```typescript
<div style={{
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: spacing.xl,
  padding: `${spacing.xxl} ${spacing.page_margin_desktop}`,
  // Add media queries via external CSS or Tailwind
  // Grid becomes 1 column on mobile
}}>
  {/* Content */}
</div>
```

---

## Import Template

Always include these in every page:

```typescript
'use client';  // If using hooks (useState, etc)

import Navigation from '@/app/components/Navigation';
import Footer from '@/app/components/Footer';
import { colors, typography, spacing } from '@/lib/design-tokens';

// Optional icons (from lucide-react)
import { Mail, MapPin, Phone, Instagram } from 'lucide-react';
```

---

## Link Hover Effect

```typescript
<a href="#"
  style={{
    color: colors.black,
    textDecoration: 'none',
    transition: 'color 0.25s ease',
  }}
  onMouseEnter={(e) => {
    (e.currentTarget as HTMLElement).style.color = colors.gold;
  }}
  onMouseLeave={(e) => {
    (e.currentTarget as HTMLElement).style.color = colors.black;
  }}
>
  Link Text
</a>
```

---

## Use This When Building!

Just copy patterns above and customize text/content. All colors, fonts, and spacing are already set for consistency.

**Key Rule:** Always use `design-tokens.ts` values — never hardcode colors or sizes!

---

## Questions About Patterns?

Refer to:
- `app/contact/page.tsx` — Full working example
- `lib/design-tokens.ts` — All available values
- This file — Quick patterns

Ready to build the next page! 🎯
