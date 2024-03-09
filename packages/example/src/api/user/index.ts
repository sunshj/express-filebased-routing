import { defineEventHandler } from 'express-filebased-routing'
import { createOne, findAll } from './services'
import { createUserDto, findAllUserDto } from './dto'

export default defineEventHandler({
  GET: [findAllUserDto, findAll],
  POST: [createUserDto, createOne]
})
