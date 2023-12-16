import path from 'path'
import fs from 'fs/promises'
import type { Handlers, ModulesMap, NormalizeFilenameOptions, RequestMethod } from './types'
import { pathToFileURL } from 'url'
import { CATCH_ALL_ROUTE_REGEXP, REQUEST_METHOD } from './constant'

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
  if (CATCH_ALL_ROUTE_REGEXP.test(filename))
    return normalizePath(filename.replace(CATCH_ALL_ROUTE_REGEXP, '*'))
  return normalizeFilename(filename)
}

/**
 * 规范化路径
 */
export function normalizePath(path: string, frontSlash: boolean = true) {
  return path.replace(/\\/g, '/').replace(/^[/]*/, frontSlash ? '/' : '')
}

/**
 * 规范化文件名
 */
export function normalizeFilename(filename: string, options?: NormalizeFilenameOptions) {
  const removeExtname = options?.removeExtname ?? true
  const replaceIndex = options?.replaceIndex ?? true
  const dotIndex = removeExtname ? filename.lastIndexOf('.') : -1
  return (
    filename
      .slice(0, dotIndex > 0 ? dotIndex : filename.length)
      .replace(/\\/g, '/')
      .replace(replaceIndex ? 'index' : '/', '/')
      .replace(/\[([^\]]+)\]/g, ':$1')
      .replace(/^[/]*/, '/')
      .replace(/[/]*$/, '') || '/'
  )
}

export function normalizeRequestMethod(method: RequestMethod) {
  return method.toLowerCase() as Lowercase<RequestMethod>
}

async function importModule<T>(filePath: string): Promise<Awaited<T>> {
  return isCjs() ? require(filePath) : await import(pathToFileURL(filePath).href)
}

export async function readModules(dir: string, ignoreFiles: string[] = []) {
  const ignoreFilesPath = ignoreFiles.map(v =>
    normalizeFilename(v, { removeExtname: false, replaceIndex: false })
  )
  let routesPath: string
  const modules: ModulesMap = new Map()
  const catchAllModules: ModulesMap = new Map()

  const readModule = async (dir: string) => {
    if (!routesPath) routesPath = dir
    const files = await fs.readdir(dir)
    for (const file of files) {
      const filePath = path.join(dir, file)
      const normalizedFilePath = normalizeFilename(filePath, {
        removeExtname: false,
        replaceIndex: false
      })
      if (ignoreFilesPath.includes(normalizedFilePath)) continue

      const stat = await fs.stat(filePath)

      if (stat.isDirectory()) {
        await readModule(filePath)
      } else {
        const urlKey = getRouterPath(routesPath, filePath)
        const handlers = await importModule<Handlers>(filePath)

        const handlersEntries = Object.entries(handlers) as [RequestMethod, Handlers][]
        if (!handlersEntries.length) continue

        const validHandlers: Handlers = {}
        for (const [key, value] of handlersEntries) {
          if (REQUEST_METHOD.includes(key)) {
            Reflect.set(validHandlers, key, value)
            if (urlKey.includes('*')) {
              catchAllModules.set(urlKey, { filePath, handlers: validHandlers })
            } else {
              modules.set(urlKey, { filePath, handlers: validHandlers })
            }
          }
        }
      }
    }
  }

  await readModule(dir)
  const sortedModules = toSortedModulesMap(modules)
  const sortedCatchAllModules = toSortedModulesMap(catchAllModules, false)
  sortedCatchAllModules.forEach((value, key) => sortedModules.set(key, value))

  return sortedModules
}

function toSortedModulesMap(map: ModulesMap, positive: boolean = true): ModulesMap {
  return new Map(
    Array.from(map)
      .sort((a, b) => (positive ? a[0].length - b[0].length : b[0].length - a[0].length))
      .map(v => [v[0], v[1]])
  )
}
