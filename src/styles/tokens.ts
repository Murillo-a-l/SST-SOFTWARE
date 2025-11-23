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
  bgApp: '#F2F0EB',
  bgCard: '#FFFFFF',
  bgMuted: '#F7F9FC',
  border: '#D4DCE6',
  borderSoft: '#E3E8F2',
  borderMuted: '#C8D2E0',
  textPrimary: '#1F2A3D',
  textSecondary: '#4B5568',
  textMuted: '#6B7A92',
  primary: '#0F4C5C',
  primaryDark: '#0C3B49',
  accentCopper: '#C07954',
  accentGold: '#D9B26D',
  success: '#4CA48C',
  warning: '#E0A458',
  danger: '#D05C60',
  retroSand: '#EDE3D5',
  retroTerracotta: '#C6917B',
  retroBordo: '#864E63',
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
