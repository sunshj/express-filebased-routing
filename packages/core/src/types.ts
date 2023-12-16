import type { Handler } from 'express'
import type { REQUEST_METHOD } from './constant'

export type RequestMethod = (typeof REQUEST_METHOD)[number]

export type Handlers = Partial<Record<RequestMethod, Handler>>

export type ModulesMap = Map<string, { filePath: string; handlers: Handlers }>

export interface Options {
  directory?: string
  globalPrefix?: string
  ignoreFiles?: string[]
  logger?:
    | boolean
    | {
        enable: boolean
        baseUrl?: string
      }
}

export interface NormalizeFilenameOptions {
  removeExtname?: boolean
  replaceIndex?: boolean
}
