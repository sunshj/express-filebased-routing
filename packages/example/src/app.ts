import path from 'node:path'
import express from 'express'
import createError from 'http-errors'
import { setupRouter } from 'express-filebased-routing'

const app = express()

async function main() {
  console.log('\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n')
  app.use(express.json())
  app.use(express.urlencoded({ extended: false }))
  app.set('views', path.join(__dirname, 'views'))
  app.set('view engine', 'ejs')

  // app.use(
  //   routerSync({
  //     directory: path.join(__dirname),
  //     ignoreFiles: ['**/*.ejs'],
  //     logger: {
  //       enable: true,
  //       baseUrl: 'http://localhost:3000'
  //     }
  //   })
  // )

  await setupRouter(app, {
    directory: path.join(__dirname),
    additionalMethod: ['HEAD'],
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
