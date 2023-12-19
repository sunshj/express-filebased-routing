import type { Express, Handler, Router } from 'express'
import type { REQUEST_METHOD } from './constant'

export type ExpressOrRouter = Express | Router

export type RequestMethod = (typeof REQUEST_METHOD)[number]

export type Handlers = Partial<Record<RequestMethod, Handler>>

export type ModulesMap = Map<string, { filePath: string; handlers: Handlers }>

export interface RouteData {
  urlKey: string
  method: Lowercase<RequestMethod>
  filePath: string
  handler: Handler
}

export interface Options {
  directory?: string
  globalPrefix?: string
  ignoreFiles?: string[]
  logger?:
    | boolean
    | ((data: RouteData[]) => void)
    | {
        enable: boolean
        baseUrl?: string
        handler?: (data: RouteData[]) => void
      }
}

export interface NormalizeFilenameOptions {
  removeExtname?: boolean
  replaceIndex?: boolean
}

export type TableDataRow = [RequestMethod, string, string]
