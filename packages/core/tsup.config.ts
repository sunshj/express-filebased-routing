import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src'],
  format: ['cjs', 'esm'],
  outExtension({ format }) {
    return {
      js: format === 'esm' ? '.mjs' : '.cjs'
    }
  },
  clean: true,
  dts: true,
  cjsInterop: true,
  silent: true,
  minify: true,
  external: ['express']
})
