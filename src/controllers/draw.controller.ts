import { Context } from 'hono'
import { BaseController } from './base.controller'
import { executeDrawSchema } from '@/schemas/draw.schema'
import { DrawRecordService } from '@/services/drawRecord.service'

export class DrawController extends BaseController {
  constructor(private readonly drawRecordService: DrawRecordService = new DrawRecordService()) {
    super(drawRecordService)
  }

  async execute(c: Context) {
    return this.handleRequest(c, async () => {
      const { drawSetId, number } = executeDrawSchema.parse(await c.req.json())
      const jwt = c.get('jwtPayload')
      
      if (number === undefined) {
        throw new Error('Number is required')
      }
      const result = await this.drawRecordService.execute(jwt.id, drawSetId, number)
      
      return {
        drawNumber: result.drawNumber,
        prize: result.Prize,
        message: `恭喜抽中 ${result.Prize.name}!`
      }
    }, '抽獎失敗')
  }

  async getHistory(c: Context) {
    return this.handleRequest(c, async () => {
      const jwt = c.get('jwtPayload')
      return this.drawRecordService.getHistory(jwt.id)
    }, '取得歷史紀錄失敗')
  }

  async getDrawSetHistory(c: Context) {
    return this.handleRequest(c, async () => {
      const { drawSetId } = c.req.param()
      return this.drawRecordService.getDrawSetHistory(drawSetId)
    }, '取得歷史紀錄失敗')
  }
}