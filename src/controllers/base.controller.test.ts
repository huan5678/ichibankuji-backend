import { Context } from 'hono'
import { BaseController } from './base.controller'
import { BaseService } from '@/services/base.service'

class TestController extends BaseController {
  constructor(service: BaseService) {
    super(service)
  }

  public async testHandleRequest<T>(
    ctx: Context,
    action: () => Promise<T>,
    errorMessage?: string
  ) {
    return this.handleRequest(ctx, action, errorMessage)
  }
}

describe('BaseController', () => {
  let mockCtx: Context
  let controller: TestController
  let mockService: BaseService

  beforeEach(() => {
    mockCtx = {
      json: jest.fn().mockReturnThis(),
    } as unknown as Context

    mockService = {} as BaseService
    controller = new TestController(mockService)
  })

  describe('handleRequest', () => {
    test('should handle successful request', async () => {
      const mockData = { id: 1, name: 'test' }
      const mockAction = jest.fn().mockResolvedValue(mockData)

      await controller.testHandleRequest(mockCtx, mockAction)

      expect(mockCtx.json).toHaveBeenCalledWith(
        { success: true, data: mockData },
        200
      )
    })

    test('should handle Error with custom message', async () => {
      const errorMessage = 'Custom error'
      const mockAction = jest.fn().mockRejectedValue(new Error(errorMessage))

      await controller.testHandleRequest(mockCtx, mockAction)

      expect(mockCtx.json).toHaveBeenCalledWith(
        { success: false, error: errorMessage },
        400
      )
    })

    test('should handle generic error with default message', async () => {
      const mockAction = jest.fn().mockRejectedValue('Some error')
      const defaultError = '操作失敗'

      await controller.testHandleRequest(mockCtx, mockAction)

      expect(mockCtx.json).toHaveBeenCalledWith(
        { success: false, error: defaultError },
        400
      )
    })

    test('should handle error with custom error message parameter', async () => {
      const mockAction = jest.fn().mockRejectedValue('Some error')
      const customError = 'Custom error message'

      await controller.testHandleRequest(mockCtx, mockAction, customError)

      expect(mockCtx.json).toHaveBeenCalledWith(
        { success: false, error: customError },
        400
      )
    })
  })
})