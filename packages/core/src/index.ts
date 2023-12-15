import path from 'path'
import Table from 'cli-table'
import type { Express } from 'express'
import { normalizePath, normalizeRequestMethod, readModules } from './utils'
import type { Options, REQUEST_METHOD } from './types'

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
 * @param {string} [options.globalPrefix]
 * @param [options.logger] false
 */
export async function setupRouter(app: Express, options?: Options) {
  const routesPath = options?.directory ?? path.join(getModuleParent()?.path as string, './routes')
  const globalPrefix = options?.globalPrefix ?? ''
  const logger = options?.logger ?? false
  const loggerBaseUrl = typeof logger === 'object' ? logger.baseUrl?.replace(/[/]*$/, '') ?? '' : ''

  const table = new Table({ head: ['Method', 'Url', 'Path'] })

  const modules = await readModules(routesPath)

  for (const [urlKey, { filePath, handlers }] of modules) {
    for (const [methodKey, handler] of Object.entries(handlers)) {
      const urlKeyWithPrefix = normalizePath(globalPrefix + urlKey)
      table.push([methodKey, loggerBaseUrl + urlKeyWithPrefix, filePath])

      const method = normalizeRequestMethod(methodKey as REQUEST_METHOD)
      app[method](urlKeyWithPrefix, handler)
    }
  }

  if (typeof logger === 'boolean' && logger) console.log(table.toString())
  else if (typeof logger === 'object' && logger.enable) console.log(table.toString())
}
