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
  // 1) 建立獎品 (純 Prize)
  @AdminAuth()
  async create(c: Context) {
    try {
      const body = await c.req.json()
      const data = createPrizeSchema.parse(body)

      const prize = await this.prizeService.create({
          name: data.name,
          description: data.description,
          image: data.image,
          isActive: data.isActive ?? true,
      })
      return this.success(c, prize)
    } catch (error) {
      return this.error(c, '建立獎品失敗', 500)
    }
  }
   // ★ 依抽獎套組 ID 取得所有獎品 (由中繼表 DrawSetPrize 查詢)
   async getByDrawSet(c: Context) {
    try {
      const { drawSetId } = c.req.param()
      const drawSet = await this.drawSetService.findById(drawSetId)
      if (!drawSet) {
        return this.error(c, '找不到抽獎套組', 404)
      }

      const pivots = await this.drawSetPrizeService.findByDrawSetId(drawSetId)
      return this.success(c, pivots)
    } catch (error) {
      return this.error(c, '取得獎品列表失敗', 500)
    }
  }

  // ★ 刪除獎品：先刪除中繼，再考慮是否要刪除 Prize
  @AdminAuth()
  async delete(c: Context) {
    try {
      const { id } = c.req.param()

      // 查找目標中繼
      const pivots = await this.drawSetPrizeService.findByPrizeId(id)
      if (!pivots.length) {
        return this.error(c, '找不到中繼關係', 404)
      }
      // 檢查所有相關套組是否已開始
      for (const pivot of pivots) {
        if (pivot.DrawSet.startTime <= new Date()) {
          return this.error(c, '抽獎套組已開始，無法刪除此獎品', 400)
        }
      }

      // 刪除所有中繼表記錄
      await Promise.all(pivots.map(pivot => this.drawSetPrizeService.remove(pivot.id)))

      return this.success(c, { message: '獎品刪除成功' })
    } catch (error) {
      return this.error(c, '刪除獎品失敗', 500)
    }
  }

  // ★ 取得單一獎品資訊（先找 Prize 本體，可再找關聯的中繼）
  async getById(c: Context) {
    try {
      const { id } = c.req.param()
      const prize = await this.prizeService.findById(id)
      if (!prize) {
        return this.error(c, '找不到對應的獎品', 404)
      }
      return this.success(c, prize)
    } catch (error) {
      return this.error(c, '查詢獎品失敗')
    }
  }

  // ★ 更新獎品資訊（只更新 Prize 本體）
  @AdminAuth()
  async update(c: Context) {
    try {
      const { id } = c.req.param()
      const body = await c.req.json()
      const data = createPrizeSchema.parse(body)

      const prize = await this.prizeService.update(id ,{
          name: data.name,
          description: data.description,
          image: data.image,
          isActive: data.isActive ?? true,
      })
      return this.success(c, prize)
    } catch (error) {
      return this.error(c, '更新獎品失敗', 500)
    }
  }
}