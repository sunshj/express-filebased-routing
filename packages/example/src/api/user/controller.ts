import type { Handler } from 'express'
import { users } from '../../db'

export const findAll: Handler = (req, res) => {
  res.send({
    data: users
  })
}
