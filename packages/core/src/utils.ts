import path from 'path'
import fs from 'fs/promises'
import type { Handlers, ModulesMap, REQUEST_METHOD } from './types'
import { pathToFileURL } from 'url'

export function isCjs() {
  return typeof module !== 'undefined' && module.exports && typeof require !== 'undefined'
}

/**
 * 获取路由路径
 */
export function getRouterPath(routesPath: string, filePath: string) {
  const relativePath = path.relative(routesPath, filePath)
  const directoryPath = path.dirname(relativePath)
  const extName = path.extname(relativePath)
  const filename = path.join(directoryPath, path.basename(filePath, extName))
  return normalizePath(filename)
}

/**
 * 规范化路径
 */
export function normalizePath(filename: string) {
  const dotIndex = filename.lastIndexOf('.')
  return (
    filename
      .slice(0, dotIndex > 0 ? dotIndex : filename.length)
      .replace(/\\/g, '/')
      .replace('index', '/')
      .replace(/\[([^\]]+)\]/g, ':$1')
      .replace(/^[/]*/, '/')
      .replace(/[/]*$/, '') || '/'
  )
}

export function normalizeRequestMethod(method: REQUEST_METHOD) {
  return method.toLowerCase() as Lowercase<REQUEST_METHOD>
}

export async function readModules(dir: string) {
  let routesPath: string
  const modules: ModulesMap = new Map()

  const readModule = async (dir: string) => {
    if (!routesPath) routesPath = dir
    const files = await fs.readdir(dir)

    for (const file of files) {
      const filePath = path.join(dir, file)
      const filePathUrl = pathToFileURL(filePath).href

      const stat = await fs.stat(filePath)

      if (stat.isDirectory()) {
        await readModule(filePath)
      } else if (stat.isFile()) {
        const urlKey = getRouterPath(routesPath, filePath)
        const handlers: Handlers = isCjs() ? require(filePath) : await import(filePathUrl)

        if (!Object.keys(handlers).length) continue

        const validHandlers: Handlers = {}
        for (const [key, value] of Object.entries(handlers)) {
          if (['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(key)) {
            Reflect.set(validHandlers, key, value)
          }
        }

        modules.set(urlKey, { filePath, handlers: validHandlers })
      }
    }
  }

  await readModule(dir)

  return modules
}
