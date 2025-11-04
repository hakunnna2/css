/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",              // Scans files in the root folder (like App.tsx)
    "./components/**/*.{js,ts,jsx,tsx}", // Scans ALL files in the components folder
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}