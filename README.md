# express-filebased-routing

## 支持功能

- [x] 基于文件系统的路由
- [x] 自定义全局前缀
- [x] 可在控制台打印路由列表
- [x] 支持 ES Module 和 CommonJS
- [x] 支持路由中间件

## API 设计

1. 类型声明

   ```typescript
   interface Options {
     // 默认读取项目目录下的routes文件夹
     directory?: string
     // 排除某些文件/目录
     ignoreFiles?: string[]
     // 设置全局前缀
     globalPrefix?: string
     // 是否在控制台打印路由列表，可配置baseUrl
     logger?:
       | boolean
       | ((data: RouteData[]) => void)
       | {
           enable: boolean
           baseUrl?: string
           handler?: (data: RouteData[]) => void
         }
   }

   declare function setupRouter(app: Express, options?: Options): Promise<void>
   ```

2. 项目引入

   ```typescript
   import express from 'express'
   import createError from 'http-errors'
   import { setupRouter } from 'express-filebased-routing'

   const app = express()

   await setupRouter(app)

   app.use((req, res, next) => {
     next(createError(404))
   })

   app.listen(3000)
   ```

   > 如不支持顶层await，可使用异步函数包裹

## 基础使用

1. 基础路由如 `routes/index.js` ，对应了 `GET /` ，支持 `GET/POST/PUT/PATCH/DELETE/ALL `

   ```typescript
   export const GET: Handler = (req, res) => {
     res.send('Hello World!')
   }

   // ESM 中也可以使用默认default导出创建 app.all()
   const ALL: Handler = (req, res) => {
     res.send('match all method')
   }

   export default ALL
   ```

2. 动态路由使用 `routes/user/[id].js` 命名，对应了 `/user/:id`
3. 路由捕获使用 `routes/[...catch].js` 命名，对应了 `/*` ，`routes/user/[...catch].js` 则对应了 `/user/*`

## 进阶使用

路由中间件

```typescript
const sayHello = (req, res) => res.send('Hello World!')

export const GET = (req, res) => [authMiddleware, sayHello]
```

## 其他

1. 路由导入顺序

   - 文件路由
   - 动态路由
   - 路由捕获

2. 此外每个路由按照GET、POST、PUT、PATCH、DELETE、ALL的顺序依次注册
