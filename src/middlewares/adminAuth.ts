import { Context, Next } from 'hono'
import { Role } from '@prisma/client'

export async function adminAuth(c: Context): Promise<Response | void> {
  const jwt = c.get('jwtPayload')
  
  if (!jwt || jwt.role !== Role.ADMIN) {
    return c.json({ 
      success: false, 
      error: '需要管理員權限' 
    }, 403)
  }
}