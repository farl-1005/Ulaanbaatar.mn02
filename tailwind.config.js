module.exports = {
  content: ['./src/**/*.{html,js}'],
  theme: {
    extend: {
      colors: {
        page: 'rgb(var(--c-page) / <alpha-value>)',
        card: 'rgb(var(--c-card) / <alpha-value>)',
        soft: 'rgb(var(--c-soft) / <alpha-value>)',
        line: 'rgb(var(--c-line) / <alpha-value>)',
        ink: 'rgb(var(--c-ink) / <alpha-value>)',
        muted: 'rgb(var(--c-muted) / <alpha-value>)',
        navy: 'rgb(var(--c-navy) / <alpha-value>)',
        ubred: 'rgb(var(--c-red) / <alpha-value>)',
        ubblue: 'rgb(var(--c-blue) / <alpha-value>)',
        ubyellow: 'rgb(var(--c-yellow) / <alpha-value>)',
        ubgreen: 'rgb(var(--c-green) / <alpha-value>)',
        ubamber: 'rgb(var(--c-amber) / <alpha-value>)',
        greenink: 'rgb(var(--c-green-ink) / <alpha-value>)',
        amberink: 'rgb(var(--c-amber-ink) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['"Golos Text"', 'Manrope', 'system-ui', '-apple-system', '"Segoe UI"', 'Roboto', 'Arial', 'sans-serif'],
      },
      maxWidth: { site: '1320px' },
    },
  },
  plugins: [],
};
