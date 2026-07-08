/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brightsun: '#fcdb32',
        bigstone: '#141d38',
      }
    }
  },
  plugins: [],
}
