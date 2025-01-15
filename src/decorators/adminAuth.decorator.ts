import { Context, Next } from 'hono'
import { adminAuth, checkAdminRole } from '@/middlewares/adminAuth'

export function AdminAuth() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value

    descriptor.value = async function (c: Context, next: Next, ...args: any[]) {
      try {
        // 在測試環境中模擬headers
        if (process.env.NODE_ENV === 'development') {
          c.req.raw.headers.set('Authorization', 'Bearer test-token');
        }
        
        await adminAuth(c, next);
        await checkAdminRole(c, next);
        
        return originalMethod.apply(this, [c, next, ...args]);
      } catch (error) {
        return c.json({
          success: false,
          error: '未授權的訪問'
        }, 401);
      }
    }

    return descriptor
  }
}