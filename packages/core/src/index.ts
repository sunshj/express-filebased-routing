import path from 'node:path'
import { callbackify } from 'node:util'
import glob from 'fast-glob'
import Table from 'cli-table'
import { type Application, Router, type RouterOptions } from 'express'
import { generateRouter } from './router'
import { normalizePath } from './utils'
import type { ExpressOrRouter, Options, RequestMethod, TableDataRow } from './types'

export { Options, RequestMethod }

/**
 * 获取调用模块的当前目录
 * @description 此方法不能迁移至外部！
 */
function getModuleParent() {
  return Object.values(require.cache)?.find(m => m?.children.includes(module))
}

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
  const routesPath = options?.directory ?? path.join(getModuleParent()?.path as string, './routes')
  const globalPrefix = options?.globalPrefix ?? ''
  const logger = options?.logger ?? false
  const loggerBaseUrl =
    typeof logger === 'object' ? normalizePath(logger.baseUrl!, false) ?? '' : ''
  const ignoreFiles = await glob(options?.ignoreFiles ?? [], { absolute: true })

  const table = new Table<TableDataRow>({ head: ['Method', 'Url', 'Path'] })

  const routes = await generateRouter(routesPath, ignoreFiles)
  for (const route of routes) {
    const { urlKey, method, filePath, handler } = route
    const urlKeyWithPrefix = normalizePath(globalPrefix + urlKey)
    const upperCaseMethod = method.toUpperCase() as Uppercase<RequestMethod>
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

export const setupRouterSync = callbackify<ExpressOrRouter, Options, ExpressOrRouter>(setupRouter)

export async function router(options?: Options & { routerOptions?: RouterOptions }) {
  return await setupRouter<Router>(Router(options?.routerOptions ?? {}), options)
}
