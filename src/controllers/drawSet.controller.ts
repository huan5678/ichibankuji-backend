import { Context } from 'hono'
import { BaseController } from './base.controller'
import { AdminAuth } from '@/decorators/adminAuth.decorator'
import { DrawSetService } from '@/services/drawSet.service'
import { DrawSetPrizeService } from '@/services/drawSetPrize.service'
import { PrizeService } from '@/services/prize.service'

export class DrawSetController extends BaseController {
  constructor(
    private readonly drawSetService: DrawSetService = new DrawSetService(),
    private readonly drawSetPrizeService: DrawSetPrizeService = new DrawSetPrizeService(),
    private readonly prizeService: PrizeService = new PrizeService()
  ) {
    super(drawSetService)
  }

  async getAll(c: Context) {
    return this.handleRequest(
      c,
      () => this.drawSetService.findAll(),
      '取得抽獎套組失敗'
    )
  }

  @AdminAuth()
  async create(c: Context) {
    return this.handleRequest(
      c,
      async () => {
        const { name, description, price, maxDraws, startTime, endTime } = await c.req.json()
        return this.drawSetService.create({
          name,
          description,
          price,
          maxDraws,
          startTime: new Date(startTime),
          endTime: new Date(endTime)
        })
      },
      '建立抽獎套組失敗'
    )
  }

  async getById(c: Context) {
    return this.handleRequest(
      c,
      async () => {
        const { id } = c.req.param()
        return this.drawSetService.findById(id)
      },
      '取得抽獎套組失敗'
    )
  }

  @AdminAuth()
  async update(c: Context) {
    return this.handleRequest(
      c,
      async () => {
        const { id } = c.req.param()
        const { name, description, price, maxDraws, startTime, endTime } = await c.req.json()
        return this.drawSetService.update(id, {
          name,
          description,
          price,
          maxDraws,
          startTime: new Date(startTime),
          endTime: new Date(endTime)
        })
      },
      '更新抽獎套組失敗'
    )
  }

  @AdminAuth()
  async delete(c: Context) {
    return this.handleRequest(
      c,
      async () => {
        const { id } = c.req.param()
        const drawSet = await this.drawSetService.findById(id)
        if (!drawSet) {
          throw new Error('找不到抽獎套組')
        }
        
        await this.drawSetPrizeService.deleteByDrawSetId(id)
        await this.drawSetService.delete(id)
        return drawSet
      },
      '刪除抽獎套組失敗'
    )
  }

  @AdminAuth()
  async getPrizesByDrawSetId(c: Context) {
    return this.handleRequest(
      c,
      async () => {
        const { id } = c.req.param()
        const prizes = await this.drawSetPrizeService.findByDrawSetId(id)
        if (!prizes) throw new Error('找不到對應的獎品')
        return prizes
      },
      '取得抽獎套組的獎品失敗'
    )
  }
}