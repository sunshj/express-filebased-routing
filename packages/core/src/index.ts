import path from 'path'
import glob from 'fast-glob'
import Table from 'cli-table'
import type { Express } from 'express'
import { normalizePath, normalizeRequestMethod, readModules } from './utils'
import type { Options, RequestMethod } from './types'

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
export async function setupRouter(app: Express, options?: Options) {
  const routesPath = options?.directory ?? path.join(getModuleParent()?.path as string, './routes')
  const globalPrefix = options?.globalPrefix ?? ''
  const logger = options?.logger ?? false
  const loggerBaseUrl = typeof logger === 'object' ? logger.baseUrl?.replace(/[/]*$/, '') ?? '' : ''

  const ignoreFiles = await glob(options?.ignoreFiles ?? [], { absolute: true })

  const table = new Table({ head: ['Sid', 'Method', 'Url', 'Path'] })

  const modules = await readModules(routesPath, ignoreFiles)
  let count = 0

  for (const [urlKey, { filePath, handlers }] of modules) {
    for (const [methodKey, handler] of Object.entries(handlers)) {
      count += 1
      const urlKeyWithPrefix = normalizePath(globalPrefix + urlKey)
      table.push([count.toString(), methodKey, loggerBaseUrl + urlKeyWithPrefix, filePath])

      const method = normalizeRequestMethod(methodKey as RequestMethod)
      app[method](urlKeyWithPrefix, handler)
    }
  }

  if (typeof logger === 'boolean' && logger) console.log(table.toString())
  else if (typeof logger === 'object' && logger.enable) console.log(table.toString())
}
