/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        viraso: {
          gold: '#d9a441',
          goldSoft: '#f7d77b',
          dark: '#0a0a0a',
          darkSoft: '#111111',
          light: '#f5f5f5',
        },
      },
      boxShadow: {
        glow: '0 0 25px rgba(217, 164, 65, 0.35)',
      },
      fontFamily: {
        viraso: ['"Geometr415 Blk BT"', '"Geometr 415"', 'Eurostile', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

