import { defineEventHandler } from 'express-filebased-routing'

export default defineEventHandler(() => {
  return 'User Not Found!'
})
