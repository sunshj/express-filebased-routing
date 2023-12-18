import type { Handler } from 'express'

export const GET: Handler = (req, res) => {
  res.send('404 Not Found!')
}
