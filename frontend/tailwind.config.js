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
        'brutal-black': '#0A0A0A',
        'brutal-white': '#F5F5F5',
        'brutal-gray': '#D4D4D4',
        'brutal-accent': '#FF6B35',
      },
      fontFamily: {
        'mono': ['monospace'],
      },
    },
  },
  plugins: [],
}
