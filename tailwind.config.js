/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      container: {
        center: true,
        padding: {
          DEFAULT: '0.7rem',
          sm: '0.7rem',
          lg: '1rem',
          xl: '1rem',
          '2xl': '6rem',
        },
      },
      fontFamily: {
        virgil: ['Virgil', 'cursive'], // Add Virgil as a custom font
      },
    },
  },
  plugins: [],
};
