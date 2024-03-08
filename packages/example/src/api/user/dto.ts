import joi from 'joi'
import { createDtoValidator } from '../../middlewares'

export const findAllUserDto = createDtoValidator({
  query: {
    page: joi.number().integer().min(1).required(),
    size: joi.number().integer().min(1).max(20).required()
  }
})

export const createUserDto = createDtoValidator({
  body: {
    userName: joi.string().min(2).max(12).required(),
    password: joi.string().min(5).max(15).required()
  }
})
