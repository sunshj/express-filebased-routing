import { DEFINE_EVENT_HANDLER_NAME, REQUEST_METHOD } from './constant'
import {
  getRouterPath,
  isCatchAllRoute,
  isDynamicRoute,
  normalizeFilename,
  readModules,
  readModulesSync,
  toSortedHandlers,
  toSortedModulesMap
} from './utils'
import type {
  Handlers,
  LowercaseRequestMethod,
  ModulesMap,
  RequestMethod,
  RouteData
} from './types'

export async function generateRouter(dir: string, ignoreFiles: string[] = []) {
  const defaultModules: ModulesMap = new Map()
  const dynamicModules: ModulesMap = new Map()
  const catchAllModules: ModulesMap = new Map()

  const modules = await readModules<Handlers>(dir, filePath => {
    const ignoreFilesPath = ignoreFiles.map(v =>
      normalizeFilename(v, { removeExtname: false, replaceIndex: false })
    )
    const normalizedFilePath = normalizeFilename(filePath, {
      removeExtname: false,
      replaceIndex: false
    })
    if (ignoreFilesPath.includes(normalizedFilePath)) return
    return filePath
  })

  for (const [filePath, handlers] of modules) {
    const urlKey = getRouterPath(dir, filePath)

    const handlersEntries = Object.entries(handlers) as [
      RequestMethod | 'DEFAULT',
      Handlers<RequestMethod | 'DEFAULT'> & { name?: string }
    ][]
    if (handlersEntries.length === 0) continue

    const validHandlers: Handlers = {}

    for (const [key, value] of handlersEntries) {
      if ([...REQUEST_METHOD, 'DEFAULT'].includes(key.toUpperCase())) {
        if (!Reflect.has(validHandlers, key.toUpperCase())) {
          if (Reflect.has(value, DEFINE_EVENT_HANDLER_NAME)) {
            Reflect.deleteProperty(value, 'name')
            Object.assign(validHandlers, value)
          } else {
            Reflect.set(
              validHandlers,
              key.toUpperCase() === 'DEFAULT' ? 'ALL' : key.toUpperCase(),
              value
            )
          }
        }

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

  const sortedModules = toSortedModulesMap(defaultModules, (a, b) => a - b)
  const sortedDynamicModules = toSortedModulesMap(dynamicModules, (a, b) => a - b)
  const sortedCatchAllModules = toSortedModulesMap(catchAllModules, (a, b) => b - a)

  sortedDynamicModules.forEach((value, key) => sortedModules.set(key, value))
  sortedCatchAllModules.forEach((value, key) => sortedModules.set(key, value))

  const result: RouteData[] = []

  for (const [urlKey, { filePath, handlers }] of sortedModules) {
    for (const [methodKey, handler] of Object.entries(toSortedHandlers(handlers))) {
      const method = methodKey.toLowerCase() as LowercaseRequestMethod
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

export function generateRouterSync(dir: string, ignoreFiles: string[] = []) {
  const defaultModules: ModulesMap = new Map()
  const dynamicModules: ModulesMap = new Map()
  const catchAllModules: ModulesMap = new Map()

  const modules = readModulesSync<Handlers>(dir, filePath => {
    const ignoreFilesPath = ignoreFiles.map(v =>
      normalizeFilename(v, { removeExtname: false, replaceIndex: false })
    )
    const normalizedFilePath = normalizeFilename(filePath, {
      removeExtname: false,
      replaceIndex: false
    })
    if (ignoreFilesPath.includes(normalizedFilePath)) return
    return filePath
  })

  for (const [filePath, handlers] of modules) {
    const urlKey = getRouterPath(dir, filePath)

    const handlersEntries = Object.entries(handlers) as [
      RequestMethod | 'DEFAULT',
      Handlers<RequestMethod | 'DEFAULT'> & { name?: string }
    ][]
    if (handlersEntries.length === 0) continue

    const validHandlers: Handlers = {}

    for (const [key, value] of handlersEntries) {
      if ([...REQUEST_METHOD, 'DEFAULT'].includes(key.toUpperCase())) {
        if (!Reflect.has(validHandlers, key.toUpperCase())) {
          if (Reflect.has(value, DEFINE_EVENT_HANDLER_NAME)) {
            Reflect.deleteProperty(value, 'name')
            Object.assign(validHandlers, value)
          } else {
            Reflect.set(
              validHandlers,
              key.toUpperCase() === 'DEFAULT' ? 'ALL' : key.toUpperCase(),
              value
            )
          }
        }

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

  const sortedModules = toSortedModulesMap(defaultModules, (a, b) => a - b)
  const sortedDynamicModules = toSortedModulesMap(dynamicModules, (a, b) => a - b)
  const sortedCatchAllModules = toSortedModulesMap(catchAllModules, (a, b) => b - a)

  sortedDynamicModules.forEach((value, key) => sortedModules.set(key, value))
  sortedCatchAllModules.forEach((value, key) => sortedModules.set(key, value))

  const result: RouteData[] = []

  for (const [urlKey, { filePath, handlers }] of sortedModules) {
    for (const [methodKey, handler] of Object.entries(toSortedHandlers(handlers))) {
      const method = methodKey.toLowerCase() as LowercaseRequestMethod
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
