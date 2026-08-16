// lib/design-tokens.ts
// Global design system - use these values across ALL pages for consistency

export const colors = {
  // Primary
  black: '#0D0D0D',
  white: '#F8F8F6',
  
  // Accent
  gold: '#C4A97D',
  gold_dark: '#8B6F47',
  
  // Greys
  grey_dark: '#7A7870',
  grey_light: '#9C9890',
  grey_bg: '#F0EEE8',
  
  // Borders
  border: '#DEDBD4',
  
  // Backgrounds
  bg_light: '#F8F8F6',
  bg_dark: '#141414',
  bg_darker: '#0D0D0D',
  
  // Status
  success: '#10B981',
  error: '#EF4444',
};

export const typography = {
  // Font sizes - INCREASED for readability
  h1: '52px',        // Page headers
  h2: '40px',        // Section headers
  h3: '32px',        // Sub headers
  h4: '24px',        // Card titles
  body_lg: '18px',   // Large body text
  body: '16px',      // Regular body text
  body_sm: '14px',   // Small text
  label: '12px',     // Labels & small text
  eyebrow: '11px',   // Tiny section labels
};

export const spacing = {
  // Consistent margins & padding across all pages
  xs: '8px',
  sm: '12px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
  
  // Section spacing (vertical gaps)
  section_gap: '64px',
  section_padding: '48px',
  
  // Page margins (sides)
  page_margin_desktop: '48px',
  page_margin_tablet: '32px',
  page_margin_mobile: '20px',
};

export const borderRadius = {
  none: '0px',
  sm: '2px',
  md: '8px',
  lg: '12px',
};

export const layout = {
  // Max content width (for large screens)
  max_width: '1920px',
  
  // Nav height
  nav_height: '70px',
  
  // Section min height
  hero_height: '600px',
  card_height: '400px',
};

// Tailwind-compatible utility classes
export const tailwindConfig = {
  colors,
  spacing,
  borderRadius,
};
