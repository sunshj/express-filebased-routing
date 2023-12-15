import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src'],
  loader: {
    '.ejs': 'copy'
  },
  clean: true,
  shims: true,
  external: ['express', 'http-errors', 'joi', 'ejs']
})
