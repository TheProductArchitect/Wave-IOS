/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        waveBg: '#000000',
        waveCyan: '#00FFFF',
      },
    },
  },
  plugins: [],
};