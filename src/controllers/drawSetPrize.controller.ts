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
  // ★ 將已存在的 Prize 加進指定抽獎套組
  @AdminAuth()
  async addPrize(c: Context) {
    try {
      const body = await c.req.json()
      const data = addPrizeSchema.parse(body)

      // 檢查 DrawSet 是否存在
      const drawSet = await this.drawSetService.findById(data.drawSetId)
      if (!drawSet) {
        return this.error(c, '找不到抽獎套組', 404)
      }
      // 檢查 Prize 是否存在
      const existingPrize = await this.prizeService.findById(data.prizeId)
      if (!existingPrize) {
        return this.error(c, '找不到指定的獎品', 404)
      }

      // 檢查是否已經加入？
      const existingPivot = await this.drawSetPrizeService.findByDrawSetId(data.drawSetId)
      if (existingPivot) {
        return this.error(c, '此獎品已在套組中，請用更新介面調整稀有度')
      }

      const pivot = await this.drawSetPrizeService.create({
          drawSetId: data.drawSetId,
          prizeId: data.prizeId,
          rarity: data.rarity})

      return this.success(c, pivot)
    } catch (error) {
      return this.error(c, '加入獎品至套組失敗', 500)
    }
  }

  // ★ 更新獎品稀有度
  @AdminAuth()
  async updateRarity(c: Context) {
      try {
        const { id } = c.req.param()
        const body = await c.req.json()
        const data = updatePrizeRaritySchema.parse(body)
  
        // 檢查中繼關係是否存在
        const existingPivot = await this.drawSetService.findById(id)
  
        if (!existingPivot) {
          return this.error(c, '找不到對應的獎品關係', 404)
        }
  
        // 檢查抽獎套組是否已開始
        if (existingPivot.startTime <= new Date()) {
          return this.error(c, '抽獎套組已開始，無法修改稀有度', 400)
        }
  
        const updated = await this.drawSetPrizeService.updateRarity(existingPivot.id, data.rarity)
  
        return this.success(c, updated)
      } catch (error) {
        return this.error(c, '更新獎品稀有度失敗', 500)
      }
    }
  
    @AdminAuth()
    async removePrize(c: Context) {
      try {
        const { drawSetId, prizeId } = c.req.param()
  
        const existingPivot = await this.drawSetService.findById(drawSetId)
  
        if (!existingPivot) {
          return this.error(c, '找不到對應的獎品關係', 404)
        }
  
        // 檢查抽獎套組是否已開始
        if (existingPivot.startTime <= new Date()) {
          return this.error(c, '抽獎套組已開始，無法移除獎品', 400)
        }
  
        await this.drawSetPrizeService.remove(existingPivot.id)
  
        return this.success(c, { message: '獎品移除成功' })
      } catch (error) {
        return this.error(c, '移除獎品失敗', 500)
      }
    }
}