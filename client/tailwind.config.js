/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#5B4CF5',
        accent: '#E1396C',
        tiktok: {
          dark: '#000000',
          cyan: '#69C9D0'
        },
        background: '#F8F9FA',
        card: '#FFFFFF',
        'text-primary': '#1A1A2E',
        'text-secondary': '#6B7280'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      borderRadius: {
        'card': '12px',
        'input': '8px'
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0,0,0,0.08)'
      }
    },
  },
  plugins: [],
}
