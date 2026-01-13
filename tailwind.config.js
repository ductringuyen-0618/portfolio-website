/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        earth: {
          50: '#f5f2ed',   // Lightest - backgrounds
          100: '#dbd2c3',  // Light
          200: '#c4b69e',  // Medium-light
          300: '#b4a68f',  // Medium
          400: '#aa9b82',  // Medium-dark
          500: '#887d69',  // Primary (darkest from palette)
          600: '#6b6252',  // Dark (derived)
          700: '#4e483c',  // Darkest (derived for footer/text)
          800: '#3a362d',  // Extra dark
          900: '#262420',  // Near black
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
