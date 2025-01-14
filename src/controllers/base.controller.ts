import { Context } from 'hono'
import { ContentfulStatusCode } from 'hono/utils/http-status'
import { BaseService } from '@/services/base.service'

export abstract class BaseController {
  constructor(protected readonly service: BaseService) {}

  protected success<T>(ctx: Context, data: T, status = 200) {
    return ctx.json({ success: true, data }, status as ContentfulStatusCode)
  }

  protected error(ctx: Context, message: string, status = 400) {
    return ctx.json({ success: false, error: message }, status as ContentfulStatusCode)
  }

  protected async handleRequest<T>(
    ctx: Context,
    action: () => Promise<T>,
    errorMessage: string = '操作失敗'
  ) {
    try {
      const result = await action()
      return this.success(ctx, result)
    } catch (error) {
      console.error(error)
      const errorMessageToUse = error instanceof Error ? error.message : errorMessage
      return this.error(ctx, errorMessageToUse)
    }
  }
}