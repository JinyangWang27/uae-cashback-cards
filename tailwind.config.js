/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        base: '#0A0C0F',
        surface: '#111318',
        gold: '#C8A45A',
        'gold-light': '#E8C87A',
        emerald: '#34D399',
        danger: '#F87171',
        warm: '#F0EDE8',
        muted: '#8B8FA8',
        border: '#1E2128',
      },
      fontFamily: {
        serif: ['"DM Serif Display"', 'Georgia', 'serif'],
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      backgroundImage: {
        'grid-texture':
          'linear-gradient(rgba(200,164,90,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(200,164,90,0.03) 1px, transparent 1px)',
      },
      backgroundSize: {
        grid: '40px 40px',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        fadeSlideIn: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        shimmer: 'shimmer 2.5s linear infinite',
        'fade-slide-in': 'fadeSlideIn 0.4s ease forwards',
      },
    },
  },
  plugins: [],
}
