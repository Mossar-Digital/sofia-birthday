import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Chocolat / café — les profondeurs
        espresso: '#231309',
        cacao: '#33200F',
        moka: '#4A2E19',
        chocolat: '#5E3A20',
        noisette: '#7C5334',
        // Beige chaud / crème — la lumière
        caramel: '#A87C4F',
        latte: '#C9A47C',
        creme: '#F0DFC6',
        parchemin: '#F7EDDC',
        // Accents
        carmin: '#9B2B34',
        carminClair: '#BE4550',
        dore: '#C8A34C',
        doreClair: '#E6C879',
      },
      fontFamily: {
        sans: ['var(--font-jost)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['var(--font-cormorant)', 'Georgia', 'serif'],
        script: ['var(--font-script)', 'cursive'],
      },
      boxShadow: {
        polaroid: '0 18px 40px -18px rgba(20, 10, 4, 0.75), 0 2px 6px rgba(20, 10, 4, 0.35)',
        warm: '0 24px 60px -24px rgba(0, 0, 0, 0.7)',
        insetGold: 'inset 0 0 0 1px rgba(200, 163, 76, 0.28)',
      },
      keyframes: {
        spinSlow: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.85' },
          '50%': { transform: 'scale(1.06)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-160% 0' },
          '100%': { backgroundPosition: '260% 0' },
        },
        sway: {
          '0%, 100%': { transform: 'rotate(-2.2deg)' },
          '50%': { transform: 'rotate(2.2deg)' },
        },
      },
      animation: {
        'spin-slow': 'spinSlow 3.2s linear infinite',
        'spin-vinyl': 'spinSlow 1.8s linear infinite',
        breathe: 'breathe 4.5s ease-in-out infinite',
        shimmer: 'shimmer 5s ease-in-out infinite',
        sway: 'sway 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
