import path from 'path'
import fs from 'fs/promises'
import Table from 'cli-table'
import { pathToFileURL } from 'url'
import type { Express } from 'express'
import { getRouterPath, isCjs, normalizePath, normalizeRequestMethod } from './utils'
import type { Handlers, ModulesMap, Options, REQUEST_METHOD } from './types'

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

  const modules: ModulesMap = new Map()
  const table = new Table({ head: ['Method', 'Url', 'Path'] })

  const readModules = async (dir: string) => {
    const files = await fs.readdir(dir)

    for (const file of files) {
      const filePath = path.join(dir, file)
      const filePathUrl = pathToFileURL(filePath).href

      const stat = await fs.stat(filePath)

      if (stat.isDirectory()) {
        await readModules(filePath)
      } else if (stat.isFile()) {
        const urlKey = getRouterPath(routesPath, filePath)
        const handlers: Handlers = isCjs() ? require(filePath) : await import(filePathUrl)
        modules.set(urlKey, { filePath, handlers })
      }
    }
  }

  await readModules(routesPath)

  for (const [urlKey, { filePath, handlers }] of modules) {
    Object.entries(handlers).map(([methodKey, handler]) => {
      const urlKeyWithPrefix = normalizePath(globalPrefix + urlKey)
      table.push([methodKey, loggerBaseUrl + urlKeyWithPrefix, filePath])

      const method = normalizeRequestMethod(methodKey as REQUEST_METHOD)
      app[method](urlKeyWithPrefix, handler)
    })
  }

  if (typeof logger === 'boolean' && logger) console.log(table.toString())
  else if (typeof logger === 'object' && logger.enable) console.log(table.toString())
}
