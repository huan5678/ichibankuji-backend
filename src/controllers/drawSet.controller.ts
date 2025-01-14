import { Context } from 'hono'
import { BaseController } from './base.controller'

export class DrawSetController extends BaseController {
  async getAll(c: Context) {
    try {
      const drawSets = await this.prisma.drawSet.findMany({
        include: {
          // 由於已改為中繼表，需改用 DrawSetPrizes
          DrawSetPrizes: {
            include: {
              Prize: true
            }
          }
        }
      })
      return this.success(c, drawSets)
    } catch (error) {
      return this.error(c, '取得抽獎套組失敗')
    }
  }

  async create(c: Context) {
    try {
      const { name, description, price, maxDraws, startTime, endTime } = await c.req.json()
      
      const drawSet = await this.prisma.drawSet.create({
        data: {
          name,
          description,
          price,
          maxDraws,
          startTime: new Date(startTime),
          endTime: new Date(endTime)
        }
      })

      return this.success(c, drawSet)
    } catch (error) {
      return this.error(c, '建立抽獎套組失敗')
    }
  }
}