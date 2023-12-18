# express-filebased-routing

## Install

```bash
npm i express-filebased-routing
```

## Usage

```typescript
import express from 'express'
import createError from 'http-errors'
import { setupRouter } from 'express-filebased-routing'

async function main() {
  const app = express()

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

export const GET: Handler = (_req, res) => {
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
interface Options {
  directory?: string
  globalPrefix?: string
  logger?:
    | boolean
    | {
        enable: boolean
        baseUrl?: string
      }
}

declare function setupRouter(app: Express, options?: Options): Promise<void>

export { setupRouter }
```
