/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        baby: {
          pink: '#f9a8d4',
          purple: '#e9d5ff',
          blue: '#bfdbfe',
          yellow: '#fef08a',
          green: '#bbf7d0',
        },
      },
    },
  },
  plugins: [],
}

