import { Context, Next } from 'hono'
import { jwtAuth, checkAdminRole } from '@/middlewares/adminAuth'

// 管理員權限裝飾器
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
        if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
          c.req.raw.headers.set('Authorization', 'Bearer test-token');
        }
        
        // 先驗證 JWT
        await jwtAuth(c, async () => {
          // 再檢查是否為管理員
          await checkAdminRole(c, async () => {
            // 最後執行原始方法
            await originalMethod.apply(this, [c, next, ...args]);
          });
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : '未授權的訪問';
        return c.json({
          success: false,
          error: message
        }, 401);
      }
    }

    return descriptor
  }
}

// 用戶權限裝飾器 (只需要登入)
export function UserAuth() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value

    descriptor.value = async function (c: Context, next: Next, ...args: any[]) {
      try {
        // 在測試環境中模擬headers
        if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
          c.req.raw.headers.set('Authorization', 'Bearer test-token');
        }
        
        // 驗證 JWT
        await jwtAuth(c, async () => {
          // 執行原始方法
          await originalMethod.apply(this, [c, next, ...args]);
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : '未授權的訪問';
        return c.json({
          success: false,
          error: message
        }, 401);
      }
    }

    return descriptor
  }
}