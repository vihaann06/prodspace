/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5', // Primary (Focus) - Indigo
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
        },
        accent: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#6ee7b7',
          500: '#10B981', // Accent (Energy) - Emerald Green
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
        },
        background: {
          light: '#F9FAFB', // Background (Light) - White / Soft Gray
          dark: '#1E293B',  // Background (Dark) - Slate
        },
        text: {
          primary: '#111827',   // Text Primary - Charcoal
          secondary: '#6B7280', // Text Secondary - Cool Gray
        },
        warning: '#EF4444',     // Warning / Danger - Rose Red
        success: '#84CC16',     // Success / Done - Lime Green
        highlight: '#FBBF24',   // Highlight - Amber Yellow
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
} 