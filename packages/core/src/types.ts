import type { Express, Handler, Router } from 'express'
import type { REQUEST_METHOD } from './constant'

export type ExpressOrRouter = Express | Router

export type RequestMethod = (typeof REQUEST_METHOD)[number]

export type UppercaseRequestMethod = Uppercase<RequestMethod>

export type LowercaseRequestMethod = Lowercase<RequestMethod>

export type Handlers<TMethod extends string = RequestMethod> = Partial<Record<TMethod, Handler>>

export type ModulesMap = Map<string, { filePath: string; handlers: Handlers }>

export interface RouteData<T = LowercaseRequestMethod> {
  urlKey: string
  method: T
  filePath: string
  handler: Handler
}

export interface Options<T extends string[]> {
  directory?: string
  globalPrefix?: string
  ignoreFiles?: string[]
  additionalMethod?: Readonly<T>
  logger?:
    | boolean
    | ((data: RouteData<Lowercase<RequestMethod | T[number]>>[]) => void)
    | {
        enable: boolean
        baseUrl?: string
        handler?: (data: RouteData<Lowercase<RequestMethod | T[number]>>[]) => void
      }
}

export interface NormalizeFilenameOptions {
  removeExtname?: boolean
  replaceIndex?: boolean
}

export type TableDataRow = [RequestMethod, string, string]
