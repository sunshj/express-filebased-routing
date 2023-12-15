import type { Handler } from 'express'

export const GET: Handler = (_req, res) => {
  res.send({
    msg: 'get All Users'
  })
}

export const POST: Handler = (_req, res) => {
  res.send({
    msg: 'create user'
  })
}
