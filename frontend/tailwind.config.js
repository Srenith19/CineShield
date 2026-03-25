/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        cinema: {
          950: '#0a0a1a',
          900: '#111128',
          800: '#1a1a3e',
          700: '#252554',
          600: '#32326e',
        },
        gold: {
          400: '#f5c518',
          500: '#d4a817',
        }
      }
    },
  },
  plugins: [],
}
