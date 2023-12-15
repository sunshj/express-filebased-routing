import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src'],
  clean: true,
  shims: true,
  external: ['express', 'http-errors']
})
