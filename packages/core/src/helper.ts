import { DEFINE_EVENT_HANDLER_NAME } from './constant'
import type { RequestMethod } from './types'
import type { Handler } from 'express'

type EventHandler = (...args: Parameters<Handler>) => any | Promise<any>

type BasicRequestHandlers = {
  [k in RequestMethod]: EventHandler | EventHandler[]
}

type CustomRequestHandlers = {
  [x: string]: EventHandler | EventHandler[]
}

type EventHandlerMap = Partial<BasicRequestHandlers & CustomRequestHandlers>

interface EventHandlerOptions {
  statusCode?: number
  headers?: Record<string, string>
}

export function defineEventHandler<T extends EventHandler | EventHandler[] | EventHandlerMap>(
  eventHandler: T,
  options?: T extends Function ? EventHandlerOptions : never
) {
  const statusCode = options?.statusCode ?? 200
  const headers = options?.headers ?? {}

  if (Array.isArray(eventHandler)) return eventHandler

  if (typeof eventHandler === 'function') {
    return (async (req, res, next) => {
      const data = await eventHandler(req, res, next)
      if (!data) return
      for (const [name, value] of Object.entries(headers)) {
        res.setHeader(name, value)
      }
      res.status(statusCode).send(data)
    }) as Handler
  }

  if (typeof eventHandler === 'object') {
    return Object.entries(eventHandler).reduce<EventHandlerMap>((handlers, [method, handler]) => {
      handlers[method as RequestMethod] = defineEventHandler(handler!) as Handler
      Reflect.defineProperty(handlers, DEFINE_EVENT_HANDLER_NAME, {
        value: DEFINE_EVENT_HANDLER_NAME,
        enumerable: false,
        writable: false,
        configurable: false
      })

      return handlers
    }, {})
  }
}
