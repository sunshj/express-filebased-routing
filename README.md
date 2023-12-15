# express-filebased-routing

## 功能需求

- [x] 基于文件系统的路由
- [x] 自定义全局前缀
- [x] 可在控制台打印路由列表
- [x] Promise API
- [x] 支持 ES Module 和 CommonJS
- [ ] 支持路由中间件

## API 设计

1. 类型声明

   ```typescript
   interface Options {
     // 默认读取当前目录下的routes目录
     directory?: string
     // 设置全局前缀
     globalPrefix?: string
     // 是否在控制台打印路由列表，可配置baseUrl
     logger?:
       | boolean
       | {
           enable: boolean
           baseUrl?: string
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

## 基础使用方法

1. 基础路由如 `routes/index.js` ，对应了 `GET /` ，支持 `GET/POST/PUT/PATCH/DELETE `

   ```typescript
   export const GET = (req, res) => {
     res.send('Hello World!')
   }
   ```

2. 动态路由使用 `routes/user/[id].js` 命名，对应了 `/user/:id`

## 进阶使用

路由中间件，导出数组

```typescript
export const GET = [
  authMiddleware(),
  (req, res) => {
    res.send('Hello World!')
  }
]
```
