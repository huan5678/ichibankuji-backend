import { PrizeController } from './prize.controller'
import { PrizeService } from '@/services/prize.service'
import { DrawSetService } from '@/services/drawSet.service'
import { DrawSetPrizeService } from '@/services/drawSetPrize.service'
import { BaseController } from './base.controller'

describe('PrizeController', () => {
  describe('constructor', () => {
    test('should create controller with default services', () => {
      const controller = new PrizeController()
      expect(controller).toBeInstanceOf(PrizeController)
      expect(controller).toBeInstanceOf(BaseController)
      expect(controller['prizeService']).toBeInstanceOf(PrizeService)
      expect(controller['drawSetService']).toBeInstanceOf(DrawSetService)
      expect(controller['drawSetPrizeService']).toBeInstanceOf(DrawSetPrizeService)
    })

    test('should create controller with custom services', () => {
      const mockPrizeService = new PrizeService()
      const mockDrawSetService = new DrawSetService()
      const mockDrawSetPrizeService = new DrawSetPrizeService()
      const controller = new PrizeController(mockPrizeService, mockDrawSetService, mockDrawSetPrizeService)
      expect(controller['prizeService']).toBe(mockPrizeService)
      expect(controller['drawSetService']).toBe(mockDrawSetService)
      expect(controller['drawSetPrizeService']).toBe(mockDrawSetPrizeService)
    })
  })
})