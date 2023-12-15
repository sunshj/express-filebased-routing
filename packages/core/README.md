# express-filebased-routing

## Install

```bash
npm i express-filebased-routing
```

## Usage

### ES Module

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

### CommonJS

```js
const express = require('express')
const createError = require('http-errors')
const { setupRouter } = require('express-filebased-routing')

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
