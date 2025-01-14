import { Context, Next } from 'hono'
import { z } from 'zod'

export const validate = <T extends z.ZodTypeAny>(schema: T) => {
  return async (c: Context, next: Next) => {
    try {
      const body = await c.req.json()
      const result = await schema.parseAsync(body)
      c.set('validated', result)
      await next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        return c.json({
          success: false,
          errors: error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message
          }))
        }, 400)
      }
      return c.json({ success: false, error: '驗證失敗' }, 400)
    }
  }
}