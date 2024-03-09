import { defineEventHandler } from 'express-filebased-routing'

export const GET = defineEventHandler(() => {
  return { msg: 'Express REST API is working' }
})
