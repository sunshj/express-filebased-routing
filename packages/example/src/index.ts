import type { Handler } from 'express'

export const GET: Handler = (_req, res) => {
  res.render('index', { title: 'Hello Express.js' })
}
