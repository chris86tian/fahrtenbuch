/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: '#9E7FFF', // A vibrant purple
        secondary: '#38bdf8', // A bright blue for gradients
        neutral: {
          900: '#111111',
          800: '#1E1E1E',
          700: '#2C2C2C',
          400: '#A3A3A3',
          100: '#F5F5F5',
        }
      }
    },
  },
  plugins: [],
}
