import type { Handler } from 'express'
import { findAll, createOne } from './controller'
import { joiValidator } from '../../middlewares'
import { findAllUserDto, createUserDto } from './dto'

export const GET = [joiValidator(findAllUserDto), findAll]

export const POST = [joiValidator(createUserDto), createOne]
