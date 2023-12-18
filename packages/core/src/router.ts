import { REQUEST_METHOD } from './constant'
import { getRouterPath, isCatchAllRoute, isDynamicRoute, readModules } from './utils'
import type { Handlers, ModulesMap, RequestMethod, RouteData } from './types'

export async function generateRouter(dir: string, ignoreFiles: string[] = []) {
  const defaultModules: ModulesMap = new Map()
  const dynamicModules: ModulesMap = new Map()
  const catchAllModules: ModulesMap = new Map()

  const { entryPath, modules } = await readModules<Handlers>(dir, ignoreFiles)
  for (const [filePath, handlers] of modules) {
    const urlKey = getRouterPath(entryPath, filePath)

    const handlersEntries = Object.entries(handlers) as [RequestMethod, Handlers][]
    if (handlersEntries.length === 0) continue

    const validHandlers: Handlers = {}

    for (const [key, value] of handlersEntries) {
      if (REQUEST_METHOD.includes(key)) {
        Reflect.set(validHandlers, key, value)
        if (isCatchAllRoute(urlKey)) {
          catchAllModules.set(urlKey, { filePath, handlers: validHandlers })
        } else if (isDynamicRoute(urlKey)) {
          dynamicModules.set(urlKey, { filePath, handlers: validHandlers })
        } else {
          defaultModules.set(urlKey, { filePath, handlers: validHandlers })
        }
      }
    }
  }

  const sortedModules = toSortedModulesMap(defaultModules)
  const sortedDynamicModules = toSortedModulesMap(dynamicModules)
  const sortedCatchAllModules = toSortedModulesMap(catchAllModules, false)

  sortedDynamicModules.forEach((value, key) => sortedModules.set(key, value))
  sortedCatchAllModules.forEach((value, key) => sortedModules.set(key, value))

  const result: RouteData[] = []

  for (const [urlKey, { filePath, handlers }] of sortedModules) {
    for (const [methodKey, handler] of Object.entries(handlers)) {
      const method = methodKey.toLowerCase() as Lowercase<RequestMethod>
      result.push({
        urlKey,
        filePath,
        method,
        handler
      })
    }
  }

  return result
}

function toSortedModulesMap(map: ModulesMap, positive: boolean = true): ModulesMap {
  return new Map(
    Array.from(map)
      .sort((a, b) => (positive ? a[0].length - b[0].length : b[0].length - a[0].length))
      .map(v => [v[0], v[1]])
  )
}