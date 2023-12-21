const fs = require('node:fs')
const path = require('node:path')

const corePkgPath = path.join(__dirname, '../packages/core/package.json')
const pkg = fs.readFileSync(corePkgPath).toString()
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

fs.writeFileSync(corePkgPath, JSON.stringify(pkgJson, null, 2))
