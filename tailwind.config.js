/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        midnight: {
          DEFAULT: '#FAF7F0',    // Warm Ivory Canvas
          darker: '#F3EDE2',
          lighter: '#FFFFFF',
          ink: '#111218',        // High-contrast ink for dark accents & floating dock
        },
        surface: {
          DEFAULT: '#FFFFFF',    // Crisp white card surface
          card: '#FFFFFF',
          secondary: '#F5EFE4',  // Tinted warm ivory secondary
          elevated: '#FFFFFF',
          hover: '#F2ECE0',
          active: '#EAE1D2',
          border: '#E8E2D5',     // Warm refined border
          'border-subtle': '#EFE9DC',
        },
        brand: {
          violet: {
            DEFAULT: '#A78BFA',
            hover: '#9065F6',
            light: '#C4B5FD',
            lilac: '#D8C7FF',     // Scaler Flow Lavender CTA
            lilacHover: '#CCAFFF',
            dark: '#6D28D9',
            subtle: 'rgba(167, 139, 250, 0.12)',
          },
          lime: {
            DEFAULT: '#10B981',    // Emerald / Mint
            hover: '#059669',
            dark: '#047857',
            subtle: 'rgba(16, 185, 129, 0.12)',
          },
          orange: {
            DEFAULT: '#F59E0B',    // Warm Amber / Ochre
            warm: '#FFB833',
            hover: '#D97706',
            subtle: 'rgba(245, 158, 11, 0.12)',
          },
          coral: {
            DEFAULT: '#F43F5E',
            hover: '#E11D48',
            subtle: 'rgba(244, 63, 94, 0.12)',
          },
          cyan: {
            DEFAULT: '#0EA5E9',
            hover: '#0284C7',
            subtle: 'rgba(14, 165, 233, 0.12)',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        heading: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'Menlo', 'monospace'],
        dot: ['"NDot 57"', '"NDot 55"', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
        'dock': '0 12px 30px -4px rgba(17, 18, 24, 0.25), 0 4px 12px rgba(17, 18, 24, 0.1)',
      },
      borderRadius: {
        'sm': '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
      },
    },
  },
  plugins: [],
}
