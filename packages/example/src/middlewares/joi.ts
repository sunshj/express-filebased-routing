import joi, { type Schema, type ValidationOptions } from 'joi'
import type { NextFunction, Request, Response } from 'express'

const schemaKeys = ['params', 'query', 'body'] as const
interface JoiValidationOptions extends ValidationOptions {
  strict: boolean
}

interface DtoValidateSchema {
  query?: Record<string, Schema>
  body?: Record<string, Schema>
  params?: Record<string, Schema>
}

export const joiValidator = (
  schemas: DtoValidateSchema,
  options: JoiValidationOptions = { strict: false }
) => {
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

export function createDtoValidator(schemas: DtoValidateSchema, options?: JoiValidationOptions) {
  return joiValidator(schemas, options)
}
