import { DrawSetPrizeController } from './drawSetPrize.controller'
import { DrawSetService } from '@/services/drawSet.service'
import { PrizeService } from '@/services/prize.service'
import { DrawSetPrizeService } from '@/services/drawSetPrize.service'
import { BaseController } from './base.controller'

describe('DrawSetPrizeController', () => {
  describe('constructor', () => {
    test('should create controller with default services', () => {
      const controller = new DrawSetPrizeController()
      expect(controller).toBeInstanceOf(DrawSetPrizeController)
      expect(controller).toBeInstanceOf(BaseController)
      expect(controller['drawSetService']).toBeInstanceOf(DrawSetService)
      expect(controller['prizeService']).toBeInstanceOf(PrizeService)
      expect(controller['drawSetPrizeService']).toBeInstanceOf(DrawSetPrizeService)
    })

    test('should create controller with custom services', () => {
      const mockDrawSetService = new DrawSetService()
      const mockPrizeService = new PrizeService()
      const mockDrawSetPrizeService = new DrawSetPrizeService()
      const controller = new DrawSetPrizeController(mockDrawSetService, mockPrizeService, mockDrawSetPrizeService)
      expect(controller['drawSetService']).toBe(mockDrawSetService)
      expect(controller['prizeService']).toBe(mockPrizeService)
      expect(controller['drawSetPrizeService']).toBe(mockDrawSetPrizeService)
    })
  })
})