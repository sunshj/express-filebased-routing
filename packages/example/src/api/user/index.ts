import { joiValidator } from '../../middlewares'
import { createOne, findAll } from './controller'
import { createUserDto, findAllUserDto } from './dto'

export const GET = [joiValidator(findAllUserDto), findAll]

export const POST = [joiValidator(createUserDto), createOne]
