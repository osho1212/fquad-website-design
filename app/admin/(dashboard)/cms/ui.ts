// Shared inline styles for the CMS screens. The admin uses inline styles
// throughout rather than a CSS framework, so these keep the field renderers
// consistent without repeating the same objects in five files.

import type { CSSProperties } from 'react';

export const COLORS = {
  ink: '#0D0D0D',
  paper: '#F8F8F6',
  card: '#ffffff',
  line: '#DEDBD4',
  muted: '#7A7870',
  faint: '#9C9890',
  accent: '#8A7B5C',
  danger: '#B3434A',
};

export const input: CSSProperties = {
  width: '100%',
  padding: '9px 11px',
  border: `1px solid ${COLORS.line}`,
  borderRadius: 2,
  fontSize: 14,
  fontFamily: 'inherit',
  background: '#fff',
  color: COLORS.ink,
  outline: 'none',
  lineHeight: 1.5,
};

export const textarea: CSSProperties = {
  ...input,
  minHeight: 84,
  resize: 'vertical',
};

export const label: CSSProperties = {
  display: 'block',
  fontSize: 10.5,
  letterSpacing: '0.1em',
  color: COLORS.muted,
  fontWeight: 600,
  textTransform: 'uppercase',
  marginBottom: 6,
};

export const help: CSSProperties = {
  fontSize: 12,
  color: COLORS.faint,
  marginTop: 5,
  lineHeight: 1.5,
};

export const card: CSSProperties = {
  background: COLORS.card,
  border: `0.5px solid ${COLORS.line}`,
  borderRadius: 4,
};

export const buttonBase: CSSProperties = {
  fontSize: 11,
  letterSpacing: '0.1em',
  fontWeight: 600,
  fontFamily: 'inherit',
  borderRadius: 2,
  padding: '9px 16px',
  cursor: 'pointer',
  border: `1px solid ${COLORS.line}`,
  background: 'transparent',
  color: COLORS.ink,
  whiteSpace: 'nowrap',
};

export const primaryButton: CSSProperties = {
  ...buttonBase,
  background: COLORS.ink,
  color: COLORS.paper,
  border: `1px solid ${COLORS.ink}`,
};

export const ghostButton: CSSProperties = {
  ...buttonBase,
  padding: '6px 10px',
  fontSize: 10,
  color: COLORS.muted,
};
