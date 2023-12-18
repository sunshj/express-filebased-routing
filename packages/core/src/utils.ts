import path from 'path'
import fs from 'fs/promises'
import type { NormalizeFilenameOptions } from './types'
import { pathToFileURL } from 'url'
import { CATCH_ALL_ROUTE_REGEXP } from './constant'

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
export async function readModules<TModule = {}>(dir: string, ignoreFiles: string[] = []) {
  const ignoreFilesPath = ignoreFiles.map(v =>
    normalizeFilename(v, { removeExtname: false, replaceIndex: false })
  )
  let entryPath: string = ''
  const modules = new Map<string, TModule>()

  const readModule = async (dir: string) => {
    if (!entryPath) entryPath = dir
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
        modules.set(filePath, await importModule(filePath))
      }
    }
  }

  await readModule(dir)

  return {
    entryPath,
    modules
  }
}
