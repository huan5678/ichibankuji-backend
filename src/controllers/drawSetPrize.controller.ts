import { Context } from 'hono'
import { BaseController } from './base.controller'
import { addPrizeSchema } from '@/schemas/drawSetPrize.schema'

export class DrawSetPrizeController extends BaseController {
  // ★ 將已存在的 Prize 加進指定抽獎套組
  async addPrize(c: Context) {
    try {
      const body = await c.req.json()
      const data = addPrizeSchema.parse(body)

      // 檢查 DrawSet 是否存在
      const drawSet = await this.prisma.drawSet.findUnique({
        where: { id: data.drawSetId }
      })
      if (!drawSet) {
        return this.error(c, '找不到抽獎套組', 404)
      }
      // 檢查 Prize 是否存在
      const existingPrize = await this.prisma.prize.findUnique({
        where: { id: data.prizeId }
      })
      if (!existingPrize) {
        return this.error(c, '找不到指定的獎品', 404)
      }

      // 檢查是否已經加入？
      const existingPivot = await this.prisma.drawSetPrize.findFirst({
        where: {
          drawSetId: data.drawSetId,
          prizeId: data.prizeId
        }
      })
      if (existingPivot) {
        return this.error(c, '此獎品已在套組中，請用更新介面調整稀有度')
      }

      const pivot = await this.prisma.drawSetPrize.create({
        data: {
          drawSetId: data.drawSetId,
          prizeId: data.prizeId,
          rarity: data.rarity
        },
        include: {
          DrawSet: true,
          Prize: true
        }
      })

      return this.success(c, pivot)
    } catch (error) {
      return this.error(c, '加入獎品至套組失敗', 500)
    }
  }
}