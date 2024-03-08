import { createOne, findAll } from './services'
import { createUserDto, findAllUserDto } from './dto'

export const GET = [findAllUserDto, findAll]

export const POST = [createUserDto, createOne]
