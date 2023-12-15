import type { Handler } from 'express'

export const GET: Handler = (req, res) => {
  const { id } = req.params
  res.send({
    msg: `get user #${id}`
  })
}

export const PUT: Handler = (req, res) => {
  const { id } = req.params
  res.send({
    msg: `put user #${id}`
  })
}

export const DELETE: Handler = (req, res) => {
  const { id } = req.params
  res.send({
    msg: `delete user #${id}`
  })
}
