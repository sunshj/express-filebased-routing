import path from 'node:path'
import fs from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import { CATCH_ALL_ROUTE_REGEXP, REQUEST_METHOD } from './constant'
import type {
  Handlers,
  ModulesMap,
  NormalizeFilenameOptions,
  UppercaseRequestMethod
} from './types'

function isCjs() {
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
  return path.replaceAll('\\', '/').replace(/^\/*/, frontSlash ? '/' : '')
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
      .replaceAll('\\', '/')
      .replace(replaceIndex ? 'index' : '/', '/')
      .replaceAll(/\[([^\]]+)]/g, ':$1')
      .replace(/^\/*/, '/')
      .replace(/\/*$/, '') || '/'
  )
}

export async function importModule<T>(filePath: string): Promise<Awaited<T>> {
  return isCjs() ? require(filePath) : await import(pathToFileURL(filePath).href)
}

export function isDynamicRoute(urlKey: string) {
  return urlKey.includes(':')
}

export function isCatchAllRoute(urlKey: string) {
  return urlKey.includes('*')
}

/**
 * 读取目录下的所有文件的路径和模块
 */
export async function readModules<TModule = {}>(
  directory: string,
  handler?: (data: {
    filePath: string
    dir: string
    file: string
  }) => string | Promise<string> | undefined
) {
  const modules = new Map<string, TModule>()

  const readModule = async (dir: string) => {
    const files = await fs.readdir(dir)

    for (const file of files) {
      const filePath = path.join(dir, file)
      const stat = await fs.stat(filePath)

      if (stat.isDirectory()) {
        await readModule(filePath)
      } else {
        const handleFilePath = handler ? await handler({ filePath, dir, file }) : filePath
        if (!handleFilePath) continue
        modules.set(handleFilePath, await importModule(filePath))
      }
    }
  }

  await readModule(directory)

  return modules
}

export function toSortedModulesMap(
  modulesMap: ModulesMap,
  compare: (a: number, b: number) => number
): ModulesMap {
  return new Map(
    Array.from(modulesMap)
      .sort(([a], [b]) => compare(a.length, b.length))
      .map(v => [v[0], v[1]])
  )
}

export function toSortedHandlers(
  handlers: Handlers,
  sortedList: readonly string[] = REQUEST_METHOD
) {
  return Object.entries(handlers)
    .sort(([a], [b]) => {
      const indexA = sortedList.indexOf(a as UppercaseRequestMethod)
      const indexB = sortedList.indexOf(b as UppercaseRequestMethod)

      if (indexA < indexB) {
        return -1
      } else if (indexA > indexB) {
        return 1
      } else {
        return 0
      }
    })
    .reduce((acc, [method, handler]) => {
      acc[method as UppercaseRequestMethod] = handler
      return acc
    }, {} as Handlers)
}
