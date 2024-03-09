import { defineEventHandler } from 'express-filebased-routing'

export default defineEventHandler({
  GET() {
    return 'get users list'
  }
})
