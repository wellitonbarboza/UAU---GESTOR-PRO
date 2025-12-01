/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx,jsx,js}'],
  theme: {
    extend: {
      colors: {
        primary: '#0EA5E9',
        secondary: '#0F172A'
      }
    }
  },
  plugins: []
};
