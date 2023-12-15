import type { Handler } from 'express'

export const GET: Handler = (_req, res) => {
  res.send('Hello World!')
}
