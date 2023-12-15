import path from 'path'
import express from 'express'
import createError from 'http-errors'
import { setupRouter } from 'express-filebased-routing'

async function main() {
  const app = express()
  app.use(express.json())
  app.use(express.urlencoded({ extended: false }))
  app.set('views', path.join(__dirname, 'views'))
  app.set('view engine', 'ejs')

  await setupRouter(app, {
    directory: path.join(__dirname, '.'),
    ignoreFiles: ['**/*.ejs'],
    logger: {
      enable: true,
      baseUrl: 'http://localhost:3000'
    }
  })

  app.use((req, res, next) => {
    next(createError(404))
  })

  app.listen(3000, () => {
    console.log('server listening on http://localhost:3000')
  })
}

main()
