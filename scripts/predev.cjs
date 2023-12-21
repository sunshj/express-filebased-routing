const fs = require('node:fs')
const path = require('node:path')

const corePkgPath = path.join(__dirname, '../packages/core/package.json')
const pkg = fs.readFileSync(corePkgPath).toString()
const pkgJson = JSON.parse(pkg)

pkgJson.main = 'src/index.ts'
pkgJson.module = ''
pkgJson.types = ''
pkgJson.exports = null

fs.writeFileSync(corePkgPath, JSON.stringify(pkgJson, null, 2))
