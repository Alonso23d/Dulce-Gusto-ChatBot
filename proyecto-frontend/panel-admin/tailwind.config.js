/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fdf4ff',
          100: '#fae8ff',
          200: '#f3d0fe',
          300: '#e9a8fd',
          400: '#d971fa',
          500: '#c44cf3',
          600: '#a82de0',
          700: '#8e22bc',
          800: '#751f9a',
          900: '#601c7d',
          950: '#3e075a',
        },
        rose: {
          50:  '#fff1f3',
          500: '#f43f5e',
          600: '#e11d48',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'card-hover': '0 4px 12px 0 rgb(0 0 0 / 0.12)',
        xl2: '0 20px 50px -10px rgb(0 0 0 / 0.2)',
      },
    },
  },
  plugins: [],
}
