import { defineEventHandler } from 'express-filebased-routing'

export default defineEventHandler(() => {
  return '404 Not Found!'
})
