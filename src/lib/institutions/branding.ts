// Institution Branding
// Generate custom theme CSS for white-label institutions

export interface BrandingConfig {
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string | null;
  faviconUrl?: string | null;
  customCss?: string | null;
}

// Generate CSS variables for institution theme
export function generateThemeCSS(config: BrandingConfig): string {
  const { primaryColor, secondaryColor, customCss } = config;

  // Convert hex to RGB for alpha channel support
  const primaryRGB = hexToRGB(primaryColor);
  const secondaryRGB = hexToRGB(secondaryColor);

  const css = `
    :root {
      --institution-primary: ${primaryColor};
      --institution-primary-rgb: ${primaryRGB};
      --institution-secondary: ${secondaryColor};
      --institution-secondary-rgb: ${secondaryRGB};

      /* Override default brand colors */
      --color-ocean: ${primaryColor};
      --color-teal: ${secondaryColor};
    }

    /* Override specific elements with institution branding */
    .btn-primary {
      background-color: var(--institution-primary) !important;
    }

    .btn-primary:hover {
      background-color: color-mix(in srgb, var(--institution-primary) 90%, black) !important;
    }

    .bg-ocean {
      background-color: var(--institution-primary) !important;
    }

    .bg-teal {
      background-color: var(--institution-secondary) !important;
    }

    .text-ocean {
      color: var(--institution-primary) !important;
    }

    .text-teal {
      color: var(--institution-secondary) !important;
    }

    .border-ocean {
      border-color: var(--institution-primary) !important;
    }

    .border-teal {
      border-color: var(--institution-secondary) !important;
    }

    .from-ocean {
      --tw-gradient-from: var(--institution-primary) !important;
    }

    .to-teal {
      --tw-gradient-to: var(--institution-secondary) !important;
    }

    ${customCss || ''}
  `.trim();

  return css;
}

// Convert hex color to RGB string
function hexToRGB(hex: string): string {
  // Remove # if present
  const cleanHex = hex.replace('#', '');

  // Parse hex values
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  return `${r}, ${g}, ${b}`;
}

// Get institution branding for layout
export function getInstitutionBranding(institution: {
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  name: string;
}) {
  return {
    name: institution.name,
    logo: institution.logoUrl,
    favicon: institution.faviconUrl || '/favicon.ico',
    theme: {
      primary: institution.primaryColor,
      secondary: institution.secondaryColor,
    },
    css: generateThemeCSS({
      primaryColor: institution.primaryColor,
      secondaryColor: institution.secondaryColor,
    }),
  };
}

// Predefined color palettes for institution types
export const INSTITUTION_PALETTES = {
  university: [
    { primary: '#1a237e', secondary: '#c62828', name: 'Academic Blue & Cardinal' },
    { primary: '#004d40', secondary: '#ff6f00', name: 'Forest Green & Orange' },
    { primary: '#311b92', secondary: '#ffd600', name: 'Purple & Gold' },
    { primary: '#b71c1c', secondary: '#212121', name: 'Crimson & Black' },
  ],
  city: [
    { primary: '#0d47a1', secondary: '#00897b', name: 'Civic Blue & Teal' },
    { primary: '#1b5e20', secondary: '#0277bd', name: 'Parks Green & Water Blue' },
    { primary: '#4a148c', secondary: '#ff6f00', name: 'Government Purple & Action Orange' },
  ],
  foundation: [
    { primary: '#1a237e', secondary: '#00796b', name: 'Trust Navy & Teal' },
    { primary: '#33691e', secondary: '#4527a0', name: 'Growth Green & Impact Purple' },
    { primary: '#01579b', secondary: '#f57c00', name: 'Foundation Blue & Giving Orange' },
  ],
  nonprofit: [
    { primary: '#00838f', secondary: '#c62828', name: 'Mission Teal & Passion Red' },
    { primary: '#2e7d32', secondary: '#1565c0', name: 'Hope Green & Trust Blue' },
    { primary: '#ad1457', secondary: '#00695c', name: 'Heart Pink & Nature Teal' },
  ],
  corporate: [
    { primary: '#0d47a1', secondary: '#546e7a', name: 'Professional Blue & Slate' },
    { primary: '#1565c0', secondary: '#00897b', name: 'Corporate Blue & Growth Teal' },
    { primary: '#37474f', secondary: '#0097a7', name: 'Executive Gray & Accent Cyan' },
  ],
};
