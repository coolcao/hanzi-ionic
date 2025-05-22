/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // or 'media' or 'class'
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#ff85a2',
        secondary: '#ffd3b5',
        accent: '#95e1d3',
        neutral: '#f9f7f7',
        dark: '#2a363b'
      },
      fontFamily: {
        'k': ['BanRuoKai', "STKaiti", 'sans-serif'],
      }
    },
  },
  plugins: [],
}
