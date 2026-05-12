/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist Sans', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'monospace'],
      },
      colors: {
        brand: {
          green: '#16A34A',
          'green-light': '#F0FDF4',
          'green-mid': '#DCFCE7',
          'green-dark': '#15803D',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          subtle: '#F8F9FA',
          muted: '#F3F4F6',
        },
        border: {
          DEFAULT: '#E5E7EB',
          strong: '#D1D5DB',
        },
        ink: {
          DEFAULT: '#0A0A0A',
          muted: '#6B7280',
          faint: '#9CA3AF',
        },
        agent: {
          layer1: '#2563EB',
          layer2: '#16A34A',
          gate: '#F59E0B',
          layer3: '#7C3AED',
          layer4: '#0891B2',
          error: '#EF4444',
          idle: '#9CA3AF',
        },
        dark: {
          bg: '#0A0A0A',
          card: '#1A1A1A',
          border: '#2A2A2A',
          'border-strong': '#3A3A3A',
        },
      },
      borderRadius: {
        card: '12px',
        btn: '8px',
        badge: '6px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.08)',
        'card-dark': '0 1px 3px rgba(0,0,0,0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        shimmer: 'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
