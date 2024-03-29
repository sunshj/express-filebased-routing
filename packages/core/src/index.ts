import path from 'node:path'
import glob from 'fast-glob'
import Table from 'cli-table'
import { type Application, Router, type RouterOptions } from 'express'
import { generateRouter, generateRouterSync } from './router'
import { colors, isCjs, normalizePath } from './utils'
import { GLOB_IGNORE_EXT } from './constant'
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
export async function setupRouter<TApp extends ExpressOrRouter, TMethod extends string[]>(
  app: TApp,
  options?: Options<TMethod>
) {
  const routesPath = options?.directory ?? path.join(PROJECT_DIRECTORY, './routes')
  const globalPrefix = options?.globalPrefix ?? ''
  const additionalMethod = (options?.additionalMethod ?? []).map(v => v.toUpperCase())
  const logger = options?.logger ?? false
  const loggerBaseUrl =
    typeof logger === 'object' ? normalizePath(logger.baseUrl!, false) ?? '' : ''
  const ignoreFiles = await glob([GLOB_IGNORE_EXT, ...(options?.ignoreFiles ?? [])], {
    absolute: true,
    ignore: ['node_modules']
  })

  const table = new Table<TableDataRow>({ head: ['Method', 'Url', 'Path'] })

  const routes = await generateRouter(routesPath, ignoreFiles, additionalMethod)
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

export function setupRouterSync<TApp extends ExpressOrRouter, TMethod extends string[]>(
  app: TApp,
  options?: Options<TMethod>
) {
  if (!isCjs())
    throw new Error(colors.red('setupRouterSync is only supported in CommonJS environment'))
  const routesPath = options?.directory ?? path.join(PROJECT_DIRECTORY, './routes')
  const globalPrefix = options?.globalPrefix ?? ''
  const logger = options?.logger ?? false
  const loggerBaseUrl =
    typeof logger === 'object' ? normalizePath(logger.baseUrl!, false) ?? '' : ''
  const ignoreFiles = glob.globSync([GLOB_IGNORE_EXT, ...(options?.ignoreFiles ?? [])], {
    absolute: true,
    ignore: ['node_modules']
  })

  const table = new Table<TableDataRow>({ head: ['Method', 'Url', 'Path'] })

  const routes = generateRouterSync(routesPath, ignoreFiles)
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

export async function router<TMethod extends string[] = []>(
  options?: Options<TMethod> & { routerOptions?: RouterOptions }
) {
  return await setupRouter<Router, TMethod>(Router(options?.routerOptions ?? {}), options)
}

export function routerSync<TMethod extends string[] = []>(
  options?: Options<TMethod> & { routerOptions?: RouterOptions }
) {
  if (!isCjs()) throw new Error(colors.red('routerSync is only supported in CommonJS environment'))
  return setupRouterSync<Router, TMethod>(Router(options?.routerOptions ?? {}), options)
}
