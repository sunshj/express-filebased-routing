import type { Handler } from 'express'
import type { REQUEST_METHOD } from './constant'

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
    | ((data: TableDataRow[]) => void)
    | {
        enable: boolean
        baseUrl?: string
        handler?: (data: TableDataRow[]) => void
      }
}

export interface NormalizeFilenameOptions {
  removeExtname?: boolean
  replaceIndex?: boolean
}

export type TableDataRow = [RequestMethod, string, string]
