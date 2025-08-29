/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
        roboto: ['Roboto', 'sans-serif'],
        
      },
      colors: {
        primary: '#144DA8',
        secondary: '#F8F9FA',
        success: '#3FAF3E0',
      },
    },
  },
  plugins: [],
};
