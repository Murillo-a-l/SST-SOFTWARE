export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  xxl: '32px',
};

export const radius = {
  sm: '6px',
  md: '10px',
  lg: '16px',
  xl: '20px',
};

export const colors = {
  bgApp: '#F4F6F8',
  bgCard: '#FFFFFF',
  bgMuted: '#F9FAFB',
  border: '#D5D8DC',
  borderSoft: '#E0E3E7',
  borderMuted: '#C9CDD2',
  textPrimary: '#2F343A',
  textSecondary: '#6B7480',
  textMuted: '#7B8EA3',
  primary: '#3A6EA5',
  primaryDark: '#2F5C8C',
  success: '#79A88E',
  warning: '#F6B980',
  danger: '#D97777',
  retroSand: '#E7E2D9',
  retroTerracotta: '#C48A84',
  retroBordo: '#8A5260',
};

export const shadows = {
  soft: '0 10px 30px rgba(27, 44, 76, 0.08)',
  card: '0 6px 18px rgba(47, 92, 140, 0.06)',
};

export const typography = {
  label: 'text-xs uppercase tracking-[0.18em] text-[#7B8EA3]',
  title: 'text-sm font-semibold text-slate-800',
  body: 'text-sm text-slate-800',
  secondary: 'text-xs text-slate-500',
};

export const tokens = {
  spacing,
  radius,
  colors,
  shadows,
  typography,
};

export type TokenColor = keyof typeof colors;
