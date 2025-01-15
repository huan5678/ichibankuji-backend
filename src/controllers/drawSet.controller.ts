import { Context } from 'hono'
import { BaseController } from './base.controller'
import { AdminAuth } from '@/decorators/adminAuth.decorator'
import { DrawSetService } from '@/services/drawSet.service';
import { DrawSetPrizeService } from '@/services/drawSetPrize.service';

export class DrawSetController extends BaseController {
  constructor(
    private readonly drawSetService: DrawSetService = new DrawSetService(),
    private readonly drawSetPrizeService: DrawSetPrizeService = new DrawSetPrizeService()
  ) {
    super(drawSetService)
  }
  async getAll(c: Context) {
    try {
      const drawSets = await this.drawSetService.findAll()
      return this.success(c, drawSets)
    } catch (error) {
      return this.error(c, '取得抽獎套組失敗')
    }
  }

  @AdminAuth()
  async create(c: Context) {
    try {
      const { name, description, price, maxDraws, startTime, endTime } = await c.req.json()
      
      const drawSet = await this.drawSetService.create({
        name,
        description,
        price,
        maxDraws,
        startTime: new Date(startTime),
        endTime: new Date(endTime)
      })

      return this.success(c, drawSet)
    } catch (error) {
      return this.error(c, '建立抽獎套組失敗')
    }
  }

  async getById(c: Context) {
    try {
      const { id } = c.req.param()
      const drawSet = await this.drawSetService.findById(id)
      return this.success(c, drawSet)
    } catch (error) {
      return this.error(c, '取得抽獎套組失敗')
    }
  }

  @AdminAuth()
  async update(c: Context) {
    try {
      const { id } = c.req.param()
      const { name, description, price, maxDraws, startTime, endTime } = await c.req.json()

      const drawSet = await this.drawSetService.update(id, {
          name,
          description,
          price,
          maxDraws,
          startTime: new Date(startTime),
          endTime: new Date(endTime)
        }
      )

      return this.success(c, drawSet)
    } catch (error) {
      return this.error(c, '更新抽獎套組失敗')
    }
  }

  @AdminAuth()
  async delete(c: Context) {
    try {
      const { id } = c.req.param()
      console.log('Delete ID:', id) // 增加除錯日誌
      const drawSet = await this.drawSetService.findById(id)
      if (!drawSet) {
        return this.error(c, '找不到抽獎套組', 404)
      }

      try {
        await this.drawSetPrizeService.deleteByDrawSetId(id)
      } catch (error) {
        return this.error(c, '刪除抽獎套組失敗', 400)
      }

      await this.drawSetService.delete(id)

      return this.success(c, drawSet)
    } catch (error) {
      console.error('Delete error:', error) // 增加除錯日誌
      return this.error(c, '刪除抽獎套組失敗', 400)
    }
  }
}