import { DEFINE_EVENT_HANDLER_NAME } from './constant'
import type { RequestMethod } from './types'
import type { Handler } from 'express'

type EventHandler = (...args: Parameters<Handler>) => any | Promise<any>
type EventHandlerMap = Partial<Record<RequestMethod, EventHandler | EventHandler[]>>

interface EventHandlerOptions {
  statusCode?: number
  headers?: Record<string, string>
}

export function defineEventHandler<T extends EventHandler | EventHandler[] | EventHandlerMap>(
  eventHandler: T,
  options?: EventHandlerOptions
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
    return Object.entries(eventHandler).reduce<EventHandlerMap & { name?: string }>(
      (handlers, [method, handler]) => {
        handlers[method as RequestMethod] = defineEventHandler(handler, options) as Handler
        handlers.name = DEFINE_EVENT_HANDLER_NAME
        return handlers
      },
      {}
    )
  }
}
