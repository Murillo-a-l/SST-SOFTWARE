/**
 * Tailwind configuration snapshot to mirror the design tokens.
 * The build currently relies on the CDN config in index.html, but this file
 * documents the design system for tooling compatibility.
 */
const colors = {
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
