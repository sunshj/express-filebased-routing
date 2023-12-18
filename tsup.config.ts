import { defineConfig } from 'tsup'

export default defineConfig({
  format: ['cjs', 'esm'],
  outExtension({ format }) {
    return {
      js: format === 'esm' ? '.mjs' : '.cjs'
    }
  },
  clean: true,
  dts: true,
  cjsInterop: true,
  external: ['express']
})
