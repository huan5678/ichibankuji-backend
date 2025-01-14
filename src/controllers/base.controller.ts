import { Context } from 'hono'
import { PrismaClient } from '@prisma/client'
import { ContentfulStatusCode } from 'hono/utils/http-status'

export abstract class BaseController {
  protected prisma: PrismaClient

  constructor() {
    this.prisma = new PrismaClient()
  }

  protected success<T>(ctx: Context, data: T, status = 200) {
    return ctx.json({ success: true, data }, status as ContentfulStatusCode)
  }

  protected error(ctx: Context, message: string, status = 400) {
    return ctx.json({ success: false, error: message }, status as ContentfulStatusCode)
  }
}