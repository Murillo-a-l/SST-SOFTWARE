/**
 * Tailwind configuration snapshot to mirror the design tokens.
 * The build currently relies on the CDN config in index.html, but this file
 * documents the design system for tooling compatibility.
 */
const colors = {
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

const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  xxl: '32px',
};

const borderRadius = {
  sm: '6px',
  md: '10px',
  lg: '16px',
  xl: '20px',
};

module.exports = {
  content: ['./index.html', './App.tsx', './components/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors,
      spacing,
      borderRadius,
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        card: '0 6px 18px rgba(47, 92, 140, 0.06)',
        soft: '0 10px 30px rgba(27, 44, 76, 0.08)',
      },
    },
  },
  plugins: [],
};
