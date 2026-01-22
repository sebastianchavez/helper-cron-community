/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{html,ts}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#3b82f6',
          dark: '#2563eb',
          DEFAULT: '#135bec'
        },

        background: {
          light: '#f6f6f8',
          dark: '#101622'
        },

        card: {
          light: '#ffffff',
          dark: '#1f2937'
        },

        border: {
          light: '#e5e7eb',
          dark: '#374151'
        },

        text: {
          'primary-light': '#111827',
          'primary-dark': '#f9fafb',
          'secondary-light': '#64748b',
          'secondary-dark': '#94a3b8'
        },

        sidebar: {
          light: '#ffffff',
          dark: '#0d1117'
        },

        'bubble-user': {
          light: '#e2e8f0',
          dark: '#232f48'
        },
      },
      fontFamily: {
        display: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        full: '9999px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};
