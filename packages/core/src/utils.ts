import path from 'path'
import { REQUEST_METHOD } from './types'

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
