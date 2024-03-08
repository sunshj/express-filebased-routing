import { defineEventHandler } from 'express-filebased-routing'

export const GET = defineEventHandler(() => {
  return '404 Not Found!'
})
