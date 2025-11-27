/**
 * Premium Event Management Design System
 *
 * This file contains all design tokens, utilities, and component styles
 * to ensure consistency across the application.
 */

// ============================================================================
// COLOR PALETTE
// ============================================================================

export const colors = {
  // Primary Brand Colors
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
    950: '#082f49',
  },

  // Secondary Colors
  secondary: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7e22ce',
    800: '#6b21a8',
    900: '#581c87',
    950: '#3b0764',
  },

  // Accent Colors
  accent: {
    pink: {
      50: '#fdf2f8',
      100: '#fce7f3',
      500: '#ec4899',
      600: '#db2777',
      700: '#be185d',
    },
    indigo: {
      50: '#eef2ff',
      100: '#e0e7ff',
      500: '#6366f1',
      600: '#4f46e5',
      700: '#4338ca',
      900: '#312e81',
      950: '#1e1b4b',
    },
    purple: {
      50: '#faf5ff',
      100: '#f3e8ff',
      500: '#a855f7',
      600: '#9333ea',
      900: '#581c87',
    },
  },

  // Semantic Colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
  },

  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
  },

  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
  },

  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
  },

  // Neutral Colors
  gray: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  },
} as const;

// ============================================================================
// GRADIENTS
// ============================================================================

export const gradients = {
  hero: 'bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900',
  heroLight: 'bg-gradient-to-br from-slate-50 via-white to-slate-50',
  card: {
    blue: 'bg-gradient-to-br from-blue-50 to-indigo-50',
    purple: 'bg-gradient-to-br from-purple-50 to-pink-50',
    green: 'bg-gradient-to-br from-green-50 to-emerald-50',
    indigo: 'bg-gradient-to-br from-indigo-50 to-purple-50',
  },
  button: {
    primary: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700',
    secondary: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700',
  },
  text: {
    primary: 'bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300 bg-clip-text text-transparent',
    secondary: 'bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent',
  },
  badge: 'bg-gradient-to-r from-amber-500 to-orange-500',
  section: 'bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30',
  cta: 'bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900',
} as const;

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const typography = {
  fontFamily: {
    sans: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  },

  fontSize: {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl',
    '5xl': 'text-5xl',
    '6xl': 'text-6xl',
    '7xl': 'text-7xl',
  },

  heading: {
    h1: 'text-5xl md:text-7xl font-bold',
    h2: 'text-4xl md:text-5xl font-bold',
    h3: 'text-3xl md:text-4xl font-bold',
    h4: 'text-2xl md:text-3xl font-bold',
    h5: 'text-xl md:text-2xl font-bold',
    h6: 'text-lg md:text-xl font-bold',
  },
} as const;

// ============================================================================
// SPACING
// ============================================================================

export const spacing = {
  section: {
    sm: 'py-12',
    md: 'py-16',
    lg: 'py-24',
    xl: 'py-32',
  },
  container: 'container mx-auto px-4',
} as const;

// ============================================================================
// EFFECTS
// ============================================================================

export const effects = {
  shadow: {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    '2xl': 'shadow-2xl',
    inner: 'shadow-inner',
  },

  blur: {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
  },

  glass: 'bg-white/10 backdrop-blur-sm border border-white/20',
  glassDark: 'bg-black/10 backdrop-blur-sm border border-black/20',

  cardHover: 'hover:shadow-2xl transition-all duration-300 hover:-translate-y-2',
  buttonHover: 'transition-all duration-200 hover:scale-105',
} as const;

// ============================================================================
// COMPONENT STYLES
// ============================================================================

export const components = {
  // Premium Badge
  badge: {
    default: 'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium',
    primary: 'bg-indigo-50 text-indigo-600',
    secondary: 'bg-purple-50 text-purple-600',
    success: 'bg-green-50 text-green-600',
    warning: 'bg-amber-50 text-amber-600',
    glass: 'bg-white/10 backdrop-blur-sm text-white/90 border border-white/20',
  },

  // Card Styles
  card: {
    base: 'rounded-2xl border bg-white shadow-lg',
    premium: 'rounded-2xl border-0 shadow-xl bg-white overflow-hidden',
    hover: 'rounded-2xl border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white',
    glass: 'rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20',
  },

  // Button Styles
  button: {
    primary: 'px-8 py-6 text-lg font-semibold rounded-xl shadow-lg',
    secondary: 'px-8 py-6 text-lg font-semibold rounded-xl border-2',
    icon: 'w-12 h-12 rounded-xl flex items-center justify-center',
  },

  // Input Styles
  input: {
    default: 'h-14 text-base border-2 rounded-xl shadow-sm',
    search: 'h-14 text-base border-2 focus:border-indigo-500 rounded-xl shadow-sm',
  },

  // Section Headers
  sectionHeader: {
    wrapper: 'text-center mb-16',
    badge: 'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-4 font-medium',
    title: 'text-4xl md:text-5xl font-bold mb-6 text-gray-900',
    subtitle: 'text-xl text-gray-600 max-w-3xl mx-auto',
  },
} as const;

// ============================================================================
// ANIMATIONS
// ============================================================================

export const animations = {
  fadeIn: 'animate-fade-in',
  slideUp: 'animate-slide-up',
  pulse: 'animate-pulse',
  spin: 'animate-spin',
  bounce: 'animate-bounce',
} as const;

// ============================================================================
// BACKGROUND PATTERNS
// ============================================================================

export const patterns = {
  dots: "bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9nPjwvc3ZnPg==')]",
  grid: "bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')]",
} as const;

// ============================================================================
// LAYOUT UTILITIES
// ============================================================================

export const layout = {
  page: 'min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50',
  section: 'py-24',
  container: 'container mx-auto px-4',
  grid: {
    '1': 'grid grid-cols-1 gap-8',
    '2': 'grid grid-cols-1 md:grid-cols-2 gap-8',
    '3': 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8',
    '4': 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8',
  },
  flex: {
    center: 'flex items-center justify-center',
    between: 'flex items-center justify-between',
    start: 'flex items-start justify-between',
  },
} as const;

// ============================================================================
// HERO SECTION UTILITIES
// ============================================================================

export const hero = {
  section: 'relative overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900',
  pattern: "absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9nPjwvc3ZnPg==')] opacity-40",
  orb1: 'absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl opacity-20 animate-pulse',
  orb2: 'absolute bottom-0 left-0 w-96 h-96 bg-indigo-500 rounded-full filter blur-3xl opacity-20 animate-pulse',
  container: 'container mx-auto px-4 py-24 md:py-32 relative z-10',
  wave: `<svg className="w-full h-auto" viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z" fill="rgb(248, 250, 252)"/>
  </svg>`,
} as const;

// ============================================================================
// BANNER IMAGES (Placeholder System)
// ============================================================================

export const banners = {
  hero: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1920&q=80', // Event concert
  events: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1920&q=80', // Events gathering
  dashboard: 'https://images.unsplash.com/photo-1551818255-e6e10975bc17?w=1920&q=80', // Analytics dashboard
  tickets: 'https://images.unsplash.com/photo-1594122230689-45899d9e6f69?w=1920&q=80', // Tickets

  // Event Category Images
  categories: {
    concert: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80',
    conference: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
    workshop: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
    sports: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80',
    festival: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80',
    webinar: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800&q=80',
  },

  // Placeholder for events without images
  placeholder: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80',
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate gradient orbs for hero sections
 */
export const generateGradientOrbs = () => ({
  orb1: 'absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl opacity-20 animate-pulse',
  orb2: 'absolute bottom-0 left-0 w-96 h-96 bg-indigo-500 rounded-full filter blur-3xl opacity-20 animate-pulse delay-1000',
});

/**
 * Generate status badge classes
 */
export const getStatusBadge = (status: string) => {
  const baseClasses = 'px-3 py-1 rounded-full text-xs font-semibold';
  const statusMap: Record<string, string> = {
    published: `${baseClasses} bg-green-100 text-green-800`,
    draft: `${baseClasses} bg-gray-100 text-gray-800`,
    cancelled: `${baseClasses} bg-red-100 text-red-800`,
    completed: `${baseClasses} bg-blue-100 text-blue-800`,
  };
  return statusMap[status] || statusMap.draft;
};

/**
 * Generate section header
 */
export const createSectionHeader = (badge: string, title: string, subtitle: string) => ({
  badgeText: badge,
  titleText: title,
  subtitleText: subtitle,
});

// Export all as default for easy importing
export default {
  colors,
  gradients,
  typography,
  spacing,
  effects,
  components,
  animations,
  patterns,
  layout,
  hero,
  banners,
  getStatusBadge,
  createSectionHeader,
  generateGradientOrbs,
};
