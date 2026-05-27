import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        obsidian: '#07080d',
        graphite: '#11131d',
        ion: '#7dd3fc',
        plasma: '#c084fc',
        ember: '#fb7185',
      },
      boxShadow: {
        glow: '0 0 48px rgba(125, 211, 252, 0.18)',
        glass: '0 24px 80px rgba(0, 0, 0, 0.35)',
      },
      backdropBlur: {
        xl: '28px',
      },
    },
  },
  plugins: [],
} satisfies Config;
