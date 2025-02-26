import { Context } from 'hono'
import { ContentfulStatusCode } from 'hono/utils/http-status'
import { BaseService } from '@/services'
import { PaginatedResult, PaginationParams } from '@/types'

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

  /**
   * 從請求中提取分頁參數
   */
  protected getPaginationParams(ctx: Context): PaginationParams {
    return {
      page: ctx.req.query('page') ? parseInt(ctx.req.query('page') || '1', 10) : 1,
      limit: ctx.req.query('limit') ? parseInt(ctx.req.query('limit') || '10', 10) : 10
    }
  }

  /**
   * 創建分頁結果
   */
  protected createPaginatedResult<T>(data: T[], total: number, { page, limit }: PaginationParams): PaginatedResult<T> {
    return {
      data,
      pagination: {
        total,
        page: page || 1,
        limit: limit || 10,
        totalPages: Math.ceil(total / (limit || 10))
      }
    }
  }
}