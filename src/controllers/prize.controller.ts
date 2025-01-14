import { Context } from 'hono'
import { BaseController } from './base.controller'
import { createPrizeSchema } from '@/schemas/prize.schema'
import { AdminAuth } from '@/decorators/adminAuth.decorator'

export class PrizeController extends BaseController {
  // 1) 建立獎品 (純 Prize)
  @AdminAuth()
  async create(c: Context) {
    try {
      const body = await c.req.json()
      const data = createPrizeSchema.parse(body)

      const prize = await this.prisma.prize.create({
        data: {
          name: data.name,
          description: data.description,
          image: data.image,
          isActive: data.isActive ?? true,
        }
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
      const drawSet = await this.prisma.drawSet.findUnique({ where: { id: drawSetId } })
      if (!drawSet) {
        return this.error(c, '找不到抽獎套組', 404)
      }

      const pivots = await this.prisma.drawSetPrize.findMany({
        where: { drawSetId },
        include: {
          Prize: true,
          DrawSet: true
        }
      })
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
      const pivot = await this.prisma.drawSetPrize.findUnique({
        where: { id },
        include: {
          Prize: { include: { DrawRecords: true } },
          DrawSet: true
        }
      })
      if (!pivot) {
        return this.error(c, '找不到中繼關係', 404)
      }
      // 檢查套組是否開始
      if (pivot.DrawSet.startTime <= new Date()) {
        return this.error(c, '抽獎套組已開始，無法刪除此獎品', 400)
      }
      // 檢查是否已有抽獎紀錄
      if (pivot.Prize.DrawRecords.length > 0) {
        return this.error(c, '已有人抽中此獎品，無法刪除', 400)
      }

      // 1) 刪除中繼表記錄
      await this.prisma.drawSetPrize.delete({ where: { id } })

      // 2) 確認是否仍有其他套組引用此 Prize，若無則刪除
      const stillUsed = await this.prisma.drawSetPrize.count({
        where: { prizeId: pivot.prizeId }
      })
      if (stillUsed === 0) {
        await this.prisma.prize.delete({ where: { id: pivot.prizeId } })
      }

      return this.success(c, { message: '獎品刪除成功' })
    } catch (error) {
      return this.error(c, '刪除獎品失敗', 500)
    }
  }

  // ★ 取得單一獎品資訊（先找 Prize 本體，可再找關聯的中繼）
  async getById(c: Context) {
    try {
      const { id } = c.req.param()
      const prize = await this.prisma.prize.findUnique({
        where: { id },
        include: {
          DrawSetPrizes: true
        }
      })
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

      const prize = await this.prisma.prize.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
          image: data.image,
          isActive: data.isActive ?? true,
        }
      })
      return this.success(c, prize)
    } catch (error) {
      return this.error(c, '更新獎品失敗', 500)
    }
  }
}