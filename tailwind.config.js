/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6C63FF',
          dark: '#5046FF',
          light: '#8A83FF'
        },
        secondary: '#1F1F1F',
        dark: '#121212',
        light: '#FFFFFF',
        'gray': {
          800: '#1F1F1F',
          900: '#121212',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      borderRadius: {
        'xl': '1rem',
      },
    },
  },
  plugins: [],
} 