export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  xxl: '32px',
};

export const radius = {
  xs: '6px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
};

export const colors = {
  background: {
    body: '#F4F6FB',
    surface: '#FFFFFF',
    surfaceMuted: '#EEF2F7',
  },
  border: {
    subtle: '#E0E3EB',
    strong: '#C5CBD8',
  },
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    muted: '#94A3B8',
  },
  accent: {
    primary: '#0F4C5C',
    secondary: '#C07954',
    retro: '#3FC4B5',
  },
  status: {
    success: '#2F8F5B',
    warning: '#D7931A',
    danger: '#D05C60',
  },
};

export const shadows = {
  soft: '0 8px 24px rgba(12, 26, 45, 0.08)',
  elevated: '0 14px 40px rgba(12, 26, 45, 0.12)',
};

export const typography = {
  label: 'text-[11px] font-semibold uppercase tracking-[0.2em]',
  title: 'text-lg font-semibold',
  subtitle: 'text-base font-medium',
  body: 'text-sm',
  bodyMuted: 'text-sm text-slate-500',
  caption: 'text-xs',
  mono: 'font-mono text-[11px] uppercase tracking-[0.18em] text-slate-700',
};

export const tokens = {
  spacing,
  radius,
  colors,
  shadows,
  typography,
};

export type TokenColor = keyof typeof colors;
