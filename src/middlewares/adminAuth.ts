import { Context, Next } from 'hono'
import { jwt } from 'hono/jwt'
import { Role } from '@prisma/client'

const secret = process.env.JWT_SECRET || 'example-secret-key'

export const adminAuth = jwt({
  secret,
})

export async function checkAdminRole(c: Context, next: Next) {
  const payload = c.get('jwtPayload') as { role: string }

  if (payload.role !== Role.ADMIN) {
    return c.json({ 
      success: false, 
      error: '需要管理員權限' 
    }, 403)
  }

  await next()
}