# express-filebased-routing

## Install

```bash
npm i express-filebased-routing
```

## Usage

```typescript
import express from 'express'
import createError from 'http-errors'
import { setupRouter, router } from 'express-filebased-routing'

async function main() {
  const app = express()

  // use as middleware
  // app.use(await router())

  // use as function
  await setupRouter(app)

  app.use((req, res, next) => {
    next(createError(404))
  })

  app.listen(3000)
}
main()
```

### file-based route

```js
// routes/index.js  --->  /
// routes/user/index.js  --->  /user
// routes/user/list.js  --->  /user/list
// Support Method: GET/POST/PUT/PATCH/DELETE

export const GET = (_req, res) => {
  res.send({
    msg: 'Express REST API is working'
  })
}
```

### dynamic route

```js
// routes/user/[id].js  ---> /user/:id
export const GET = (req, res) => {
  const { id } = req.params
  res.send({
    msg: `get user #${id}`
  })
}

export const PUT = (req, res) => {
  const { id } = req.params
  res.send({
    msg: `put user #${id}`
  })
}

export const DELETE = (req, res) => {
  const { id } = req.params
  res.send({
    msg: `delete user #${id}`
  })
}
```

### catch-all route

```js
// routes/[...catchall].js  ---> /*
// routes/user/[...catch].js  --->  /user/*

export const GET = (req, res) => {
  res.send('404 Not Found!')
}
```

### route middleware

```js
export const GET = [authMiddleware, rightsMiddleware, findAll]
```

## Type Definition

```typescript
declare const REQUEST_METHOD: readonly ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']

type ExpressOrRouter = Express | Router

type RequestMethod = (typeof REQUEST_METHOD)[number]

interface RouteData {
  urlKey: string
  method: Lowercase<RequestMethod>
  filePath: string
  handler: Handler
}

interface Options {
  directory?: string
  globalPrefix?: string
  ignoreFiles?: string[]
  logger?:
    | boolean
    | ((data: RouteData[]) => void)
    | {
        enable: boolean
        baseUrl?: string
        handler?: (data: RouteData[]) => void
      }
}

declare function setupRouter<TApp extends ExpressOrRouter = ExpressOrRouter>(
  app: TApp,
  options?: Options
): Promise<TApp>

declare const setupRouterSync: (
  arg1: ExpressOrRouter,
  arg2: Options,
  callback: (err: NodeJS.ErrnoException | null, result: ExpressOrRouter) => void
) => void

declare function router(
  options?: Options & {
    routerOptions?: RouterOptions
  }
): Promise<Router>

export { type Options, type RequestMethod, router, setupRouter, setupRouterSync }
```
