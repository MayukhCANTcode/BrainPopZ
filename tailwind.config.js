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
          DEFAULT: '#11121A',
          darker: '#0A0A0F',
          lighter: '#181926',
        },
        surface: {
          DEFAULT: '#1B1C29',
          card: '#1B1C29',
          secondary: '#222638',
          elevated: '#232538',
          hover: '#282B40',
          active: '#2E324B',
          border: '#292C42',
          'border-subtle': '#202234',
        },
        brand: {
          violet: {
            DEFAULT: '#A78BFA',
            hover: '#9065F6',
            light: '#C4B5FD',
            dark: '#7C3AED',
            subtle: 'rgba(167, 139, 250, 0.08)',
          },
          lime: {
            DEFAULT: '#C4F56A',
            hover: '#B1E353',
            dark: '#84B828',
            subtle: 'rgba(196, 245, 106, 0.08)',
          },
          orange: {
            DEFAULT: '#FFB86B',
            hover: '#FFA242',
            subtle: 'rgba(255, 184, 107, 0.08)',
          },
          coral: {
            DEFAULT: '#FF7F96',
            hover: '#FF6480',
            subtle: 'rgba(255, 127, 150, 0.08)',
          },
          cyan: {
            DEFAULT: '#54C7EC',
            hover: '#3ABDE8',
            subtle: 'rgba(84, 199, 236, 0.08)',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        heading: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Menlo', 'monospace'],
        dot: ['"NDot 57"', '"NDot 55"', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.4)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px -1px rgba(0, 0, 0, 0.3)',
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
