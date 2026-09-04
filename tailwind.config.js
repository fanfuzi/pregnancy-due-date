/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './about.html',
    './privacy-policy.html',
    './blog/**/*.html',
    './js/**/*.js'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#ec4899',
        secondary: '#f43f5e',
        soft: '#fdf2f8'
      }
    }
  },
  plugins: []
};
