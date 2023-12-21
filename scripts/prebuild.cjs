const fs = require('node:fs/promises')
const path = require('node:path')

async function prebuild() {
  const corePkgPath = path.join(__dirname, '../packages/core/package.json')
  const pkg = (await fs.readFile(corePkgPath)).toString()
  const pkgJson = JSON.parse(pkg)

  pkgJson.main = 'dist/index.cjs'
  pkgJson.module = 'dist/index.mjs'
  pkgJson.types = 'dist/index.d.ts'
  pkgJson.exports = {
    '.': {
      types: './dist/index.d.ts',
      require: './dist/index.cjs',
      import: './dist/index.mjs'
    }
  }

  await fs.writeFile(corePkgPath, JSON.stringify(pkgJson, null, 2))
}

prebuild()
