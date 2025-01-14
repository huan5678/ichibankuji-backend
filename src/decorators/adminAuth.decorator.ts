import { Context } from 'hono'
import { adminAuth } from '@/middlewares/adminAuth'

export function AdminAuth() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value

    descriptor.value = async function (c: Context, ...args: any[]) {
      const authResult = await adminAuth(c)
      if (authResult) return authResult
      
      return originalMethod.apply(this, [c, ...args])
    }

    return descriptor
  }
}