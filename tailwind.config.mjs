/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          bg:      '#0D1117',
          surface: '#161B22',
          card:    '#1C2128',
          border:  '#30363D',
          coral:   '#FF6B6B',
          teal:    '#4ECDC4',
          dim:     '#8B949E',
          text:    '#C9D1D9',
          white:   '#F0F6FC',
        },
      },
      fontFamily: {
        sans:    ['Nunito', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Nunito', 'sans-serif'],
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.brand.text'),
            a: { color: theme('colors.brand.coral'), '&:hover': { color: '#fff' } },
            h2: { color: '#fff', fontFamily: 'Outfit, sans-serif', fontWeight: '700' },
            h3: { color: '#fff', fontFamily: 'Outfit, sans-serif' },
            strong: { color: '#fff' },
            li: { color: theme('colors.brand.text') },
            'li::marker': { color: theme('colors.brand.coral') },
            blockquote: { borderLeftColor: theme('colors.brand.coral'), color: theme('colors.brand.dim') },
          },
        },
      }),
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
