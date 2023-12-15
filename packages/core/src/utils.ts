import path from 'path'
import fs from 'fs/promises'
import type { Handlers, ModulesMap, NormalizePathOptions, RequestMethod } from './types'
import { pathToFileURL } from 'url'
import { REQUEST_METHOD } from './contant'

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
export function normalizePath(filename: string, options?: NormalizePathOptions) {
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

export async function readModules(dir: string, ignoreFiles: string[] = []) {
  const ignoreFilesPath = ignoreFiles.map(v =>
    normalizePath(v, { removeExtname: false, replaceIndex: false })
  )
  let routesPath: string
  const modules: ModulesMap = new Map()

  const readModule = async (dir: string) => {
    if (!routesPath) routesPath = dir
    const files = await fs.readdir(dir)
    for (const file of files) {
      const filePath = path.join(dir, file)
      const normalizedFilePath = normalizePath(filePath, {
        removeExtname: false,
        replaceIndex: false
      })
      if (ignoreFilesPath.includes(normalizedFilePath)) continue
      const filePathUrl = pathToFileURL(filePath).href

      const stat = await fs.stat(filePath)

      if (stat.isDirectory()) {
        await readModule(filePath)
      } else {
        const urlKey = getRouterPath(routesPath, filePath)
        const handlers: Handlers = isCjs() ? require(filePath) : await import(filePathUrl)

        const handlersEntries = Object.entries(handlers) as [RequestMethod, Handlers][]
        if (!handlersEntries.length) continue

        const validHandlers: Handlers = {}
        for (const [key, value] of handlersEntries) {
          if (REQUEST_METHOD.includes(key)) {
            Reflect.set(validHandlers, key, value)
            modules.set(urlKey, { filePath, handlers: validHandlers })
          }
        }
      }
    }
  }

  await readModule(dir)

  return modules
}
