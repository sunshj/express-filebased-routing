import type { Request, Response, NextFunction } from 'express'
import joi, { type ValidationOptions } from 'joi'

const schemaKeys = ['params', 'query', 'body'] as const

export const joiValidator = (schemas: DtoValidateSchema, options = { strict: false }) => {
  let validateOptions: ValidationOptions = { allowUnknown: true, stripUnknown: true }
  if (!options.strict) {
    const { strict, ...rest } = options
    validateOptions = { allowUnknown: true, stripUnknown: true, ...rest }
  }

  return (req: Request, res: Response, next: NextFunction) => {
    schemaKeys.forEach(key => {
      if (!schemas[key as keyof DtoValidateSchema]) return

      const schema = joi.object(schemas[key as keyof DtoValidateSchema])
      const { error, value } = schema.validate(req[key], validateOptions)

      if (error) {
        throw error
      } else {
        req[key] = value
      }
    })

    next()
  }
}
