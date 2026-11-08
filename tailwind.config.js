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
          DEFAULT: '#0F1017',
          darker: '#0A0A0F',
          lighter: '#151622',
        },
        surface: {
          DEFAULT: '#151622',
          card: '#151622',
          elevated: '#1C1D2C',
          hover: '#1F2030',
          active: '#26273B',
          border: '#242638',
          'border-subtle': '#1B1C2A',
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
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
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
