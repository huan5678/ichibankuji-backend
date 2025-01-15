import { DrawController } from './draw.controller'
import { DrawRecordService } from '@/services/drawRecord.service'
import { BaseController } from './base.controller'

describe('DrawController', () => {
  describe('constructor', () => {
    test('should create controller with default DrawRecordService', () => {
      // Create instance with default service
      const controller = new DrawController()

      // Verify instance and inheritance
      expect(controller).toBeInstanceOf(DrawController)
      expect(controller).toBeInstanceOf(BaseController)
      
      // Verify service instantiation
      expect(controller['drawRecordService']).toBeInstanceOf(DrawRecordService)
    })

    test('should create controller with custom DrawRecordService', () => {
      // Create mock service
      const mockDrawRecordService = new DrawRecordService()
      
      // Create controller with mock service
      const controller = new DrawController(mockDrawRecordService)

      // Verify mock service was injected
      expect(controller['drawRecordService']).toBe(mockDrawRecordService)
      expect(controller).toBeInstanceOf(BaseController)
    })
  })
})