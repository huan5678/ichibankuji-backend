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

  async getById(c: Context) {
    try {
      const { id } = c.req.param()
      const drawSet = await this.prisma.drawSet.findUnique({
        where: { id },
        include: {
          DrawSetPrizes: {
            include: {
              Prize: true
            }
          }
        }
      })
      return this.success(c, drawSet)
    } catch (error) {
      return this.error(c, '取得抽獎套組失敗')
    }
  }

  async update(c: Context) {
    try {
      const { id } = c.req.param()
      const { name, description, price, maxDraws, startTime, endTime } = await c.req.json()

      const drawSet = await this.prisma.drawSet.update({
        where: { id },
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
      return this.error(c, '更新抽獎套組失敗')
    }
  }

  async delete(c: Context) {
    try {
      const { id } = c.req.param()
      const drawSet = await this.prisma.drawSet.findUnique({ where: { id } })
      if (!drawSet) {
        return this.error(c, '找不到抽獎套組', 404)
      }

      await this.prisma.drawSetPrize.deleteMany({ where: { drawSetId: id } })
      await this.prisma.drawSet.delete({ where: { id } })

      return this.success(c, drawSet)
    } catch (error) {
      return this.error(c, '刪除抽獎套組失敗')
    }
  }
}