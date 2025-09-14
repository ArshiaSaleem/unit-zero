/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#792024',
          light: '#9a2d32',
          dark: '#5a1a1c',
        },
        secondary: {
          DEFAULT: '#103352',
          light: '#1a4a6b',
          dark: '#0a2338',
        },
      },
    },
  },
  plugins: [],
}
