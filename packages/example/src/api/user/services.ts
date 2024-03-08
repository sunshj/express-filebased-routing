import { users } from '../../db'
import type { Handler } from 'express'

export const findAll: Handler = (req, res) => {
  const { page, size } = req.query
  res.send({
    data: users.slice((Number(page) - 1) * Number(size), Number(size) * Number(page))
  })
}

export const createOne: Handler = (req, res) => {
  const { name } = req.body
  res.send({
    msg: `create user ${JSON.stringify({ name })}`
  })
}
