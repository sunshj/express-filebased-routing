const fs = require('node:fs/promises')
const path = require('node:path')

async function preDev() {
  const corePkgPath = path.join(__dirname, '../packages/core/package.json')
  const pkg = (await fs.readFile(corePkgPath)).toString()
  const pkgJson = JSON.parse(pkg)

  pkgJson.main = 'src/index.ts'
  pkgJson.module = ''
  pkgJson.types = ''
  pkgJson.exports = null

  await fs.writeFile(corePkgPath, JSON.stringify(pkgJson, null, 2))
}

preDev()
