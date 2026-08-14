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
          50: '#faf9fc',   // Lightest - backgrounds
          100: '#eeecfa',  // Light - tag/surface tint
          200: '#e0dbf3',  // Medium-light - borders
          300: '#c3b8e8',  // Medium
          400: '#9b8ad9',  // Medium-dark
          500: '#4f46e5',  // Primary indigo
          600: '#4338ca',  // Primary dark (hover)
          700: '#362f8f',  // Darkest (footer/muted text)
          800: '#241f52',  // Extra dark (headings)
          900: '#17142f',  // Near black
        },
        spark: {
          400: '#fbbf24',
          500: '#f59e0b',  // Amber accent
          600: '#d97706',
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
