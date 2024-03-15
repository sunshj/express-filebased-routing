import path from 'node:path'
import glob from 'fast-glob'
import Table from 'cli-table'
import { type Application, Router, type RouterOptions } from 'express'
import { generateRouter } from './router'
import { normalizePath } from './utils'
import { GLOB_IGNORE_EXT, GLOB_IGNORE_NODE_MODULES } from './constant'
import type { ExpressOrRouter, Options, TableDataRow, UppercaseRequestMethod } from './types'

export { GLOB_IGNORE_EXT, GLOB_IGNORE_NODE_MODULES, REQUEST_METHOD } from './constant'
export { Options, RequestMethod, RouteData } from './types'
export { defineEventHandler } from './helper'

const CJS_MAIN_FILENAME = typeof require !== 'undefined' && require.main?.filename

const PROJECT_DIRECTORY = CJS_MAIN_FILENAME ? path.dirname(CJS_MAIN_FILENAME) : process.cwd()

/**
 * @param {Express} app Express application
 * @param {Options} [options]
 * @param {string} [options.directory] /routes
 * @param {string} [options.ignoreFiles] []
 * @param {string} [options.globalPrefix]
 * @param [options.logger] false
 */
export async function setupRouter<TApp extends ExpressOrRouter = ExpressOrRouter>(
  app: TApp,
  options?: Options
) {
  const routesPath = options?.directory ?? path.join(PROJECT_DIRECTORY, './routes')
  const globalPrefix = options?.globalPrefix ?? ''
  const logger = options?.logger ?? false
  const loggerBaseUrl =
    typeof logger === 'object' ? normalizePath(logger.baseUrl!, false) ?? '' : ''
  const ignoreFiles = await glob(
    [GLOB_IGNORE_NODE_MODULES, GLOB_IGNORE_EXT, ...(options?.ignoreFiles ?? [])],
    { absolute: true }
  )

  const table = new Table<TableDataRow>({ head: ['Method', 'Url', 'Path'] })

  const routes = await generateRouter(routesPath, ignoreFiles)
  for (const route of routes) {
    const { urlKey, method, filePath, handler } = route
    const urlKeyWithPrefix = normalizePath(globalPrefix + urlKey)
    const upperCaseMethod = method.toUpperCase() as UppercaseRequestMethod
    table.push([upperCaseMethod, loggerBaseUrl + urlKeyWithPrefix, filePath])
    app[method](urlKeyWithPrefix, handler as Application)
  }

  if (typeof logger === 'boolean' && logger) console.log(table.toString())
  else if (typeof logger === 'function') logger(routes)
  else if (typeof logger === 'object' && logger.enable && typeof logger.handler === 'function')
    logger.handler(routes)
  else if (typeof logger === 'object' && logger.enable) console.log(table.toString())

  return app
}

export async function router(options?: Options & { routerOptions?: RouterOptions }) {
  return await setupRouter<Router>(Router(options?.routerOptions ?? {}), options)
}
