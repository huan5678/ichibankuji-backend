import { Context, Next } from 'hono'
import { jwt } from 'hono/jwt'
import { Role } from '@prisma/client'

const secret = process.env.JWT_SECRET || 'example-secret-key'

// JWT 驗證中間件
export const jwtAuth = jwt({
  secret,
})

// 管理員角色檢查中間件
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

// 組合使用的管理員權限中間件
export function adminAuth() {
  return async (c: Context, next: Next) => {
    // 先驗證 JWT
    await jwtAuth(c, async () => {
      // 再檢查是否為管理員
      await checkAdminRole(c, next)
    })
  }
}

// 組合使用的用戶權限中間件 (只需要登入)
export function userAuth() {
  return async (c: Context, next: Next) => {
    await jwtAuth(c, next)
  }
}