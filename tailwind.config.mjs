/** @type {import('tailwindcss').Config} */
const config = {
  theme: {
    extend: {
      typography: () => ({
        DEFAULT: {
          css: [
            {
              '--tw-prose-body': 'var(--color-text)',
              '--tw-prose-headings': 'var(--color-heading)',
              h1: {
                fontFamily: 'var(--font-heading)',
                fontWeight: '700',
                marginBottom: '0.25em',
              },
              h2: {
                fontFamily: 'var(--font-heading)',
                fontWeight: '600',
              },
              h3: {
                fontFamily: 'var(--font-heading)',
                fontWeight: '600',
              },
              a: {
                color: 'var(--color-accent)',
                textDecoration: 'underline',
                textUnderlineOffset: '2px',
                '&:hover': {
                  color: 'var(--color-accent-hover)',
                },
              },
            },
          ],
        },
        base: {
          css: [
            {
              h1: { fontSize: 'var(--font-size-4xl)' },
              h2: { fontSize: 'var(--font-size-2xl)' },
              h3: { fontSize: 'var(--font-size-xl)' },
            },
          ],
        },
        md: {
          css: [
            {
              h1: { fontSize: 'var(--font-size-5xl)' },
              h2: { fontSize: 'var(--font-size-3xl)' },
              h3: { fontSize: 'var(--font-size-2xl)' },
            },
          ],
        },
      }),
    },
  },
}

export default config
