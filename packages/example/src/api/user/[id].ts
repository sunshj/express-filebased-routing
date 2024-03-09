import { defineEventHandler } from 'express-filebased-routing'
import { users } from '../../db'

export default defineEventHandler({
  GET(req) {
    const { id } = req.params
    return {
      msg: `get user #${id}`,
      user: users.find(user => user.id === Number(id))
    }
  },

  PUT(req) {
    const { id } = req.params
    return {
      msg: `put user #${id}`,
      user: users.find(user => user.id === Number(id))
    }
  },

  DELETE(req) {
    const { id } = req.params
    return {
      msg: `delete user #${id}`,
      user: users.find(user => user.id === Number(id))
    }
  },

  ALL() {
    return '405 method not allow'
  }
})
