import { defineEventHandler } from 'express-filebased-routing'

export const GET = defineEventHandler((req, res) => {
  res.render('index', { title: 'Hello Express.js' })
})
