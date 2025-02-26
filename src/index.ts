import 'module-alias/register'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'
import { jwt } from 'hono/jwt'
import { secureHeaders } from 'hono/secure-headers'
import { prettyJSON } from 'hono/pretty-json'
import { rateLimiter } from 'hono/rate-limiter'
import { PrismaClient } from '@prisma/client'
import router from '@/routes'

// 載入環境變數
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001
const HOST = process.env.HOST || 'localhost'
const JWT_SECRET = process.env.JWT_SECRET || 'secret'
const NODE_ENV = process.env.NODE_ENV || 'development'

// 建立 Prisma 客戶端
export const prisma = new PrismaClient()

// 建立 Hono 應用程式
const app = new Hono()

// 處理 CORS
app.use(
  '*',
  cors({
    origin: ['http://localhost:3000', 'https://example.com'],
    allowHeaders: ['Authorization', 'Content-Type'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    exposeHeaders: ['Content-Length'],
    maxAge: 86400,
    credentials: true,
  })
)

// 安全標頭
app.use('*', secureHeaders())

// 速率限制 (限制每個 IP 每分鐘 100 個請求)
app.use('*', rateLimiter({
  limit: 100,
  windowInSeconds: 60,
}))

// 美化 JSON 輸出 (僅在開發環境)
if (NODE_ENV === 'development') {
  app.use('*', prettyJSON())
}

// 日誌中間件
app.use('*', logger())

// JWT 認證（除了登入和註冊外的路由都需要驗證）
app.use('/api/*', async (c, next) => {
  // 略過不需要驗證的路由
  const path = c.req.path
  if (
    path.includes('/api/auth/login') || 
    path.includes('/api/auth/register') ||
    path.includes('/api/auth/forgot-password') ||
    path.includes('/api/auth/reset-password') ||
    path.includes('/api/health') ||
    path === '/api/'
  ) {
    return next()
  }
  return jwt({ 
    secret: JWT_SECRET 
  })(c, next)
})

// 健康檢查端點
app.get('/api/health', (c) => {
  const date = new Date().toLocaleString()
  return c.json({ 
    status: true,
    message: 'OK',
    uptime: process.uptime(),
    timestamp: date,
    host: c.req.url
  })
})

// 註冊所有路由
app.route('/api', router)

// 處理 404 錯誤
app.notFound((c) => {
  return c.json({ 
    success: false, 
    error: '找不到該資源' 
  }, 404)
})

// 處理伺服器錯誤
app.onError((err, c) => {
  console.error(`[ERROR] ${c.req.method} ${c.req.path}:`, err)
  return c.json({ 
    success: false, 
    error: NODE_ENV === 'production' ? '伺服器錯誤' : err.message 
  }, 500)
})

// 啟動伺服器
serve({
  fetch: app.fetch,
  port: PORT,
}, (info) => {
  console.log(`伺服器已啟動於 http://${HOST}:${info.port}`)
})

// 優雅關閉
process.on('SIGTERM', async () => {
  console.log('接收到 SIGTERM 信號，正在關閉伺服器...')
  await prisma.$disconnect()
  process.exit(0)
})