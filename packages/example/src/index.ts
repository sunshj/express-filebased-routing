import path from 'path'
import express from 'express'
import createError from 'http-errors'
import { setupRouter } from 'express-filebased-routing'

async function main() {
  const app = express()

  await setupRouter(app, {
    directory: path.join(__dirname, 'api'),
    globalPrefix: '/api',
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
