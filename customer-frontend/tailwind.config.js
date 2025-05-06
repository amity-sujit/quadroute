/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{vue,js,ts,jsx,tsx}", // Adjust based on your project structure
    ],
    theme: {
      extend: {
        colors: {
          'teal-primary': '#0d9488', // teal-600
          'teal-light': '#ccfbf1', // teal-100
          'cyan-primary': '#06b6d4', // cyan-500
        },
      },
    },
    plugins: [],
  };