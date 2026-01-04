/**
 * Theme configuration cho mobile app
 * Matching với web app design system
 */

export const colors = {
  // Primary - Indigo/Purple gradient
  primary: {
    50: '#eef2ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1',
    600: '#4f46e5',
    700: '#4338ca',
  },
  
  // Accent colors
  emerald: { light: '#d1fae5', main: '#10b981', dark: '#059669' },
  amber: { light: '#fef3c7', main: '#f59e0b', dark: '#d97706' },
  rose: { light: '#ffe4e6', main: '#f43f5e', dark: '#e11d48' },
  cyan: { light: '#cffafe', main: '#06b6d4', dark: '#0891b2' },
  
  // Neutrals
  slate: {
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
  },
  
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
};

export const gradients = {
  primary: ['#667eea', '#764ba2'],
  secondary: ['#f093fb', '#f5576c'],
  success: ['#11998e', '#38ef7d'],
  warning: ['#f2994a', '#f2c94c'],
  danger: ['#eb3349', '#f45c43'],
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 5,
  },
};


export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const typography = {
  h1: { fontSize: 28, fontWeight: '800', lineHeight: 34 },
  h2: { fontSize: 24, fontWeight: '700', lineHeight: 30 },
  h3: { fontSize: 20, fontWeight: '600', lineHeight: 26 },
  h4: { fontSize: 18, fontWeight: '600', lineHeight: 24 },
  body: { fontSize: 16, fontWeight: '400', lineHeight: 22 },
  bodyBold: { fontSize: 16, fontWeight: '600', lineHeight: 22 },
  small: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
  smallBold: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '400', lineHeight: 16 },
  captionBold: { fontSize: 12, fontWeight: '600', lineHeight: 16 },
};

// Service icons mapping (matching web)
export const serviceIcons = {
  netflix: { color: '#E50914', icon: 'play-circle' },
  spotify: { color: '#1DB954', icon: 'musical-notes' },
  youtube: { color: '#FF0000', icon: 'logo-youtube' },
  google: { color: '#4285F4', icon: 'logo-google' },
  microsoft: { color: '#00A4EF', icon: 'logo-microsoft' },
  adobe: { color: '#FF0000', icon: 'color-palette' },
  apple: { color: '#000000', icon: 'logo-apple' },
  amazon: { color: '#FF9900', icon: 'logo-amazon' },
  discord: { color: '#5865F2', icon: 'logo-discord' },
  slack: { color: '#4A154B', icon: 'logo-slack' },
  github: { color: '#181717', icon: 'logo-github' },
  dropbox: { color: '#0061FF', icon: 'logo-dropbox' },
  figma: { color: '#F24E1E', icon: 'color-wand' },
  notion: { color: '#000000', icon: 'document-text' },
  zoom: { color: '#2D8CFF', icon: 'videocam' },
  chatgpt: { color: '#10A37F', icon: 'chatbubbles' },
  canva: { color: '#00C4CC', icon: 'brush' },
  trello: { color: '#0052CC', icon: 'grid' },
};

export const getServiceConfig = (serviceName) => {
  if (!serviceName) return null;
  const lower = serviceName.toLowerCase();
  
  for (const [key, config] of Object.entries(serviceIcons)) {
    if (lower.includes(key)) return config;
  }
  
  // Special cases
  if (lower.includes('drive') || lower.includes('gmail')) return serviceIcons.google;
  if (lower.includes('office') || lower.includes('365')) return serviceIcons.microsoft;
  if (lower.includes('prime') || lower.includes('aws')) return serviceIcons.amazon;
  if (lower.includes('gpt') || lower.includes('openai')) return serviceIcons.chatgpt;
  if (lower.includes('creative') || lower.includes('photoshop')) return serviceIcons.adobe;
  
  return null;
};

export default { colors, gradients, shadows, spacing, borderRadius, typography };