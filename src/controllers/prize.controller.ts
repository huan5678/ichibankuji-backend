import { Context } from 'hono'
import { BaseController } from './base.controller'
import { createPrizeSchema } from '@/schemas/prize.schema'
import { AdminAuth } from '@/decorators/adminAuth.decorator'
import { PrizeService } from '@/services/prize.service'
import { DrawSetService } from '@/services/drawSet.service'
import { DrawSetPrizeService } from '@/services/drawSetPrize.service'

export class PrizeController extends BaseController {
  constructor(
    private readonly prizeService: PrizeService = new PrizeService(),
    private readonly drawSetService: DrawSetService = new DrawSetService(),
    private readonly drawSetPrizeService: DrawSetPrizeService = new DrawSetPrizeService()
  ) {
    super(prizeService)
  }

  @AdminAuth()
  async create(c: Context) {
    return this.handleRequest(c, async () => {
      const body = await c.req.json()
      const data = createPrizeSchema.parse(body)
      return this.prizeService.create({
        name: data.name,
        description: data.description,
        image: data.image,
        isActive: data.isActive ?? true,
      })
    }, '建立獎品失敗')
  }

  async getByDrawSet(c: Context) {
    return this.handleRequest(c, async () => {
      const { drawSetId } = c.req.param()
      const drawSet = await this.drawSetService.findById(drawSetId)
      if (!drawSet) throw new Error('找不到抽獎套組')
      return this.drawSetPrizeService.findByDrawSetId(drawSetId)
    }, '取得獎品列表失敗')
  }

  @AdminAuth()
  async delete(c: Context) {
    return this.handleRequest(c, async () => {
      const { id } = c.req.param()
      const pivots = await this.drawSetPrizeService.findByPrizeId(id)
      if (!pivots.length) throw new Error('找不到中繼關係')

      for (const pivot of pivots) {
        if (pivot.DrawSet.startTime <= new Date()) {
          throw new Error('抽獎套組已開始，無法刪除此獎品')
        }
      }

      await Promise.all(pivots.map(pivot => this.drawSetPrizeService.remove(pivot.id)))
      return { message: '獎品刪除成功' }
    }, '刪除獎品失敗')
  }

  async getById(c: Context) {
    return this.handleRequest(c, async () => {
      const { id } = c.req.param()
      const prize = await this.prizeService.findById(id)
      if (!prize) throw new Error('找不到對應的獎品')
      return prize
    }, '查詢獎品失敗')
  }

  @AdminAuth()
  async update(c: Context) {
    return this.handleRequest(c, async () => {
      const { id } = c.req.param()
      const body = await c.req.json()
      const data = createPrizeSchema.parse(body)
      return this.prizeService.update(id, {
        name: data.name,
        description: data.description,
        image: data.image,
        isActive: data.isActive ?? true,
      })
    }, '更新獎品失敗')
  }
}