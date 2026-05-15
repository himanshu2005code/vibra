import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
        },
        surface: {
          DEFAULT: 'hsl(var(--surface))',
          elevated: 'hsl(var(--surface-elevated))',
        },
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #0f0f14 0%, #1a0a12 40%, #0d1117 100%)',
        'card-shine': 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.08) 50%, transparent 60%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        shimmer: 'shimmer 2s infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
      },
    },
  },
  plugins: [],
};

export default config;
