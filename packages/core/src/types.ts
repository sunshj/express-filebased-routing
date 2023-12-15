import type { Handler } from 'express'

export type REQUEST_METHOD = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export type Handlers = Record<REQUEST_METHOD, Handler>

export type ModulesMap = Map<string, { filePath: string; handlers: Handlers }>

export interface Options {
  directory?: string
  globalPrefix?: string
  logger?:
    | boolean
    | {
        enable: boolean
        baseUrl?: string
      }
}
