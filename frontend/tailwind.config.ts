import type { Config } from 'tailwindcss';

/**
 * Noor AI — Tailwind configuration.
 * Design tokens are mirrored from src/styles/globals.css (:root) so utility
 * classes like `bg-bg-2`, `text-green-5`, `shadow-green` resolve to the same
 * values used by the hand-written CSS. Preflight is disabled because globals.css
 * already ships its own reset and the existing screens rely on it.
 */
const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  darkMode: 'class',
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        bg: {
          0: 'var(--bg-0)', 1: 'var(--bg-1)', 2: 'var(--bg-2)',
          3: 'var(--bg-3)', 4: 'var(--bg-4)', 5: 'var(--bg-5)',
        },
        green: {
          1: 'var(--green-1)', 2: 'var(--green-2)', 3: 'var(--green-3)',
          4: 'var(--green-4)', 5: 'var(--green-5)', 6: 'var(--green-6)', 7: 'var(--green-7)',
        },
        gold: {
          1: 'var(--gold-1)', 2: 'var(--gold-2)', 3: 'var(--gold-3)',
          4: 'var(--gold-4)', 5: 'var(--gold-5)', 6: 'var(--gold-6)', 7: 'var(--gold-7)',
        },
        blue: {
          1: 'var(--blue-1)', 2: 'var(--blue-2)', 3: 'var(--blue-3)',
          4: 'var(--blue-4)', 5: 'var(--blue-5)', 6: 'var(--blue-6)',
        },
        purple: {
          3: 'var(--purple-3)', 4: 'var(--purple-4)', 5: 'var(--purple-5)',
        },
        ink: {
          0: 'var(--text-0)', 1: 'var(--text-1)', 2: 'var(--text-2)',
          3: 'var(--text-3)', 4: 'var(--text-4)',
        },
      },
      fontFamily: {
        sans: ['Cairo', 'Tajawal', 'system-ui', 'sans-serif'],
        quran: ['Amiri', 'Traditional Arabic', 'serif'],
      },
      borderRadius: {
        sm: 'var(--r-sm)', md: 'var(--r-md)', lg: 'var(--r-lg)',
        xl: 'var(--r-xl)', full: 'var(--r-full)',
      },
      boxShadow: {
        md: 'var(--shadow-md)', lg: 'var(--shadow-lg)',
        green: 'var(--shadow-green)', gold: 'var(--shadow-gold)',
        'glow-green': 'var(--glow-green)', 'glow-gold': 'var(--glow-gold)',
      },
      maxWidth: {
        app: '540px',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        fadeUp: { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        scaleIn: { from: { opacity: '0', transform: 'scale(0.9)' }, to: { opacity: '1', transform: 'scale(1)' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        shimmer: { '0%': { backgroundPosition: '200% 0' }, '100%': { backgroundPosition: '-200% 0' } },
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease both',
        'fade-up': 'fadeUp 0.5s cubic-bezier(0.4,0,0.2,1) both',
        'scale-in': 'scaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both',
        float: 'float 3s ease-in-out infinite',
        shimmer: 'shimmer 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
