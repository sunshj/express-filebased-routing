import type { Handler } from 'express'
import { findAll } from './controller'

export const GET = findAll

export const POST: Handler = (req, res) => {
  if (!req.body?.name.trim()) return res.status(400).send({ msg: 'name is required' })
  const { name } = req.body
  res.send({
    msg: `create user ${JSON.stringify({ name })}`
  })
}
