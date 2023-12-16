import { Handler } from 'express'

export const GET: Handler = (req, res) => {
  res.send({
    msg: 'get users list'
  })
}
