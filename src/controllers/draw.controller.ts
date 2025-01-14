import { Context } from 'hono'
import { BaseController } from './base.controller'

export class DrawController extends BaseController {
  async execute(c: Context) {
    try {
      const { drawSetId } = await c.req.json()
      const jwt = c.get('jwtPayload')
      
      // 取得套組與中繼表
      const drawSet = await this.prisma.drawSet.findUnique({
        where: { id: drawSetId },
        include: {
          DrawSetPrizes: {
            include: {
              Prize: true
            }
          }
        }
      })
      
      if (!drawSet) {
        return this.error(c, '找不到抽獎套組')
      }

      const user = await this.prisma.user.findUnique({
        where: { id: jwt.id }
      })

      if (!user || user.credits < drawSet.price) {
        return this.error(c, '點數不足')
      }

      const available = drawSet.DrawSetPrizes.filter(p => p.Prize.isActive)
      if (available.length === 0) {
        return this.error(c, '沒有可用獎品')
      }

      // TODO: 抽獎邏輯
      const result = {
        
      }

      return this.success(c, result)
    } catch (error) {
      return this.error(c, '抽獎失敗')
    }
  }

  async getHistory(c: Context) {
    try {
      const jwt = c.get('jwtPayload')
      
      const draws = await this.prisma.drawRecord.findMany({
        where: { userId: jwt.id },
        include: {
          DrawSet: true,
          Prize: true
        }
      })

      return this.success(c, draws)
    } catch (error) {
      return this.error(c, '取得歷史紀錄失敗')
    }
  }
}