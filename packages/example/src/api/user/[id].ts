import { users } from '../../db'
import type { Handler } from 'express'

export const GET: Handler = (req, res) => {
  const { id } = req.params
  res.send({
    msg: `get user #${id}`,
    user: users.find(user => user.id === Number(id))
  })
}

export const PUT: Handler = (req, res) => {
  const { id } = req.params
  res.send({
    msg: `put user #${id}`,
    user: users.find(user => user.id === Number(id))
  })
}

export const DELETE: Handler = (req, res) => {
  const { id } = req.params
  res.send({
    msg: `delete user #${id}`,
    user: users.find(user => user.id === Number(id))
  })
}
