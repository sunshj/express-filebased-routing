import { Handler } from 'express'

export const GET: Handler = (req, res) => {
  res.send('User Not Found!')
}
