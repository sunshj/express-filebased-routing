import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src', '!src/*.d.ts'],
  loader: {
    '.ejs': 'copy'
  },
  outExtension({ format }) {
    return {
      js: format === 'esm' ? '.mjs' : '.cjs'
    }
  },
  clean: true,
  shims: true,
  silent: true,
  external: ['express', 'http-errors', 'joi', 'ejs']
})
