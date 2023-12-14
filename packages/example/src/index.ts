import express from 'express'
import { isCjs } from 'express-filebased-routing'

const app = express()

app.use('/', (req: any, res: any) => {
  res.send({
    isCjs: isCjs()
  })
})

app.listen(3000, () => {
  console.log('server listening on http://localhost:3000')
})
