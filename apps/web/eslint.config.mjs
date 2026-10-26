import astro from 'eslint-plugin-astro'

export default [
  ...astro.configs.recommended,
  {
    ignores: ['.astro/**', 'dist/**'],
  },
]
