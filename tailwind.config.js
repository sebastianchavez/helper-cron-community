/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{html,ts}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#135bec',

        'background-light': '#f6f6f8',
        'background-dark': '#101622',

        'sidebar-light': '#ffffff',
        'sidebar-dark': '#0d1117',

        'bubble-user-light': '#e2e8f0',
        'bubble-user-dark': '#232f48',

        'text-secondary-light': '#64748b',
        'text-secondary-dark': '#94a3b8',
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
