import { Context } from 'hono'
import { BaseController } from './base.controller'
import { addPrizeSchema, updatePrizeRaritySchema } from '@/schemas/drawSetPrize.schema'
import { AdminAuth } from '@/decorators/adminAuth.decorator'
import { PrizeService } from '@/services/prize.service'
import { DrawSetService } from '@/services/drawSet.service'
import { DrawSetPrizeService } from '@/services/drawSetPrize.service'

export class DrawSetPrizeController extends BaseController {
  constructor(
    private readonly drawSetService: DrawSetService = new DrawSetService(),
    private readonly prizeService: PrizeService = new PrizeService(),
    private readonly drawSetPrizeService: DrawSetPrizeService = new DrawSetPrizeService()
  ) {
    super(drawSetPrizeService)
  }

  @AdminAuth()
  async addPrize(c: Context) {
    return this.handleRequest(c, async () => {
      const body = await c.req.json()
      const data = addPrizeSchema.parse(body)

      const drawSet = await this.drawSetService.findById(data.drawSetId)
      if (!drawSet) throw new Error('找不到抽獎套組')

      const existingPrize = await this.prizeService.findById(data.prizeId)
      if (!existingPrize) throw new Error('找不到指定的獎品')

      const existingPivot = await this.drawSetPrizeService.findByDrawSetId(data.drawSetId)
      if (existingPivot) throw new Error('此獎品已在套組中，請用更新介面調整稀有度')

      return this.drawSetPrizeService.create({
        drawSetId: data.drawSetId,
        prizeId: data.prizeId,
        rarity: data.rarity
      })
    }, '加入獎品至套組失敗')
  }

  @AdminAuth()
  async updateRarity(c: Context) {
    return this.handleRequest(c, async () => {
      const { id } = c.req.param()
      const body = await c.req.json()
      const data = updatePrizeRaritySchema.parse(body)

      const existingPivot = await this.drawSetService.findById(id)
      if (!existingPivot) throw new Error('找不到對應的獎品關係')

      if (existingPivot.startTime <= new Date()) {
        throw new Error('抽獎套組已開始，無法修改稀有度')
      }

      return this.drawSetPrizeService.updateRarity(existingPivot.id, data.rarity)
    }, '更新獎品稀有度失敗')
  }

  @AdminAuth()
  async removePrize(c: Context) {
    return this.handleRequest(c, async () => {
      const { drawSetId, prizeId } = c.req.param()
      const existingPivot = await this.drawSetService.findById(drawSetId)
      if (!existingPivot) throw new Error('找不到對應的獎品關係')

      if (existingPivot.startTime <= new Date()) {
        throw new Error('抽獎套組已開始，無法移除獎品')
      }

      await this.drawSetPrizeService.remove(existingPivot.id)
      return { message: '獎品移除成功' }
    }, '移除獎品失敗')
  }
}