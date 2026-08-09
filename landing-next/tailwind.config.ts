import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      screens: { xs: '390px' },
      colors: {
        brand:  '#1E4D3A',
        accent: '#E8A93B',
        cream:  '#F5ECD9',
      },
      fontFamily: {
        baloo: ['"Baloo 2"', 'cursive'],
        sans:  ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      borderWidth: { '3': '3px' },
    },
  },
  plugins: [],
}

export default config
