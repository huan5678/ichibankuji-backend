import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { jwt } from 'hono/jwt'
import { PrismaClient } from '@prisma/client'
import router from '@/routes'

const app = new Hono()
export const prisma = new PrismaClient()

app.use(cors())
app.use('/api/*', jwt({ 
  secret: process.env.JWT_SECRET || 'secret'
}))

app.get('/', async (c) => {
  const date = new Date().toLocaleString()
  const healthCheck = {
    status: true,
    message: 'OK',
    uptime: process.uptime(),
    timestamp: date,
    host: c.req.url
};
  return c.json(healthCheck)
})

app.route('/api', router)

const port = parseInt(process.env.PORT || '3001', 10)
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})