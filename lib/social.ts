// lib/social.ts
// Central list of the studio's social profiles.
//
// ⚠️ LinkedIn, YouTube and Facebook URLs below are PLACEHOLDERS derived from the
// Instagram handle — they have not been verified and may point at an unrelated
// account. Replace them with the real profile URLs before going live.
//
// Instagram and WhatsApp are overridden at runtime from admin Site Settings
// where a page has them; the values here are the fallbacks.

export interface SocialLink {
  id: 'instagram' | 'whatsapp' | 'linkedin' | 'youtube' | 'facebook';
  label: string;
  href: string;
  /** Rendered inside a 24x24 viewBox. */
  path: string;
  /** Outline icons stroke; brand marks fill. */
  variant: 'stroke' | 'fill';
  /** Extra <path> data for multi-part outline icons. */
  extra?: { circle?: [number, number, number]; line?: [number, number, number, number] };
}

export const SOCIAL_FALLBACKS = {
  instagram: 'https://instagram.com/fquadstudio',
  whatsapp: '919876543210',
  linkedin: 'https://www.linkedin.com/company/fquadstudio', // TODO: confirm
  youtube: 'https://www.youtube.com/@fquadstudio', // TODO: confirm
  facebook: 'https://www.facebook.com/fquadstudio', // TODO: confirm
};

const ICONS = {
  instagram: {
    variant: 'stroke' as const,
    path: 'M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z',
  },
  whatsapp: {
    variant: 'fill' as const,
    path: 'M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm0 18.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.174 8.174 0 0 1-1.25-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.23 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.15.17-.25.25-.42.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.66.31-.23.25-.88.86-.88 2.09s.9 2.43 1.03 2.6c.12.17 1.77 2.7 4.29 3.78.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.23-.18-.48-.3z',
  },
  linkedin: {
    variant: 'fill' as const,
    path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  },
  youtube: {
    variant: 'fill' as const,
    path: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
  },
  facebook: {
    variant: 'fill' as const,
    path: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
  },
};

/**
 * Build the ordered list of social links, letting admin Site Settings override
 * the Instagram URL and WhatsApp number where the caller has them.
 */
export function getSocialLinks(overrides?: {
  instagramUrl?: string | null;
  whatsapp?: string | null;
}): SocialLink[] {
  const waDigits = (overrides?.whatsapp || SOCIAL_FALLBACKS.whatsapp).replace(
    /[^0-9]/g,
    ''
  );

  return [
    {
      id: 'instagram',
      label: 'Instagram',
      href: overrides?.instagramUrl || SOCIAL_FALLBACKS.instagram,
      ...ICONS.instagram,
      extra: { line: [17.5, 6.5, 17.51, 6.5] },
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      href: `https://wa.me/${waDigits}`,
      ...ICONS.whatsapp,
    },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      href: SOCIAL_FALLBACKS.linkedin,
      ...ICONS.linkedin,
    },
    {
      id: 'youtube',
      label: 'YouTube',
      href: SOCIAL_FALLBACKS.youtube,
      ...ICONS.youtube,
    },
    {
      id: 'facebook',
      label: 'Facebook',
      href: SOCIAL_FALLBACKS.facebook,
      ...ICONS.facebook,
    },
  ];
}
