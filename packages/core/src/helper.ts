import type { Handler, Request, Response } from 'express'

type EventHandler = (req: Request, res: Response) => any | Promise<any>

interface EventHandlerOptions {
  statusCode?: number
  headers?: Record<string, string>
}

export function defineEventHandler<T extends EventHandler>(
  eventHandler: T,
  options?: EventHandlerOptions
): Handler {
  const statusCode = options?.statusCode ?? 200
  const headers = options?.headers ?? {}

  return async (req, res) => {
    const data = await eventHandler(req, res)
    if (!data) return
    for (const [name, value] of Object.entries(headers)) {
      res.setHeader(name, value)
    }
    res.status(statusCode).send(data)
  }
}
