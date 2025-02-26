import { Context } from 'hono'
import { AuthController } from './auth.controller'
import { AuthService } from '@/services/auth.service'
import { BaseController } from './base.controller'

// 模擬 AuthService
const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
  verifyToken: jest.fn(),
  updateProfile: jest.fn(),
  forgotPassword: jest.fn(),
  resetPassword: jest.fn(),
  getAllUsers: jest.fn(),
  getUserById: jest.fn(),
  updateUserAsAdmin: jest.fn()
} as unknown as AuthService

// 模擬 Context
const createMockContext = () => {
  const c = {
    req: {
      json: jest.fn().mockResolvedValue({}),
      query: jest.fn().mockReturnValue(null),
      param: jest.fn().mockReturnValue('user-id')
    },
    json: jest.fn().mockReturnValue({}),
    get: jest.fn().mockReturnValue({ token: 'test-token', id: 'user-id' }),
  } as unknown as Context

  return c
}

describe('AuthController', () => {
  let controller: AuthController
  let mockContext: Context

  describe('constructor', () => {
    test('should create controller with default AuthService', () => {
      const controller = new AuthController()
      expect(controller).toBeInstanceOf(AuthController)
      expect(controller).toBeInstanceOf(BaseController)
      expect(controller['authService']).toBeInstanceOf(AuthService)
    })

    test('should create controller with custom AuthService', () => {
      const mockAuthService = new AuthService()
      const controller = new AuthController(mockAuthService)
      expect(controller['authService']).toBe(mockAuthService)
    })
  })

  describe('methods', () => {
    beforeEach(() => {
      mockContext = createMockContext()
      controller = new AuthController(mockAuthService as unknown as AuthService)
      jest.clearAllMocks()
    })

    describe('register', () => {
      it('should call authService.register and return success response', async () => {
        const mockData = { email: 'test@example.com', password: 'password', name: 'Test User' }
        const mockResult = { token: 'test-token', user: { id: '123', email: 'test@example.com', name: 'Test User', role: 'USER' } }
        
        mockContext.req.json = jest.fn().mockResolvedValue(mockData)
        mockAuthService.register = jest.fn().mockResolvedValue(mockResult)

        await controller.register(mockContext)

        expect(mockContext.req.json).toHaveBeenCalled()
        expect(mockAuthService.register).toHaveBeenCalledWith(mockData)
        expect(mockContext.json).toHaveBeenCalledWith({ success: true, data: mockResult }, 200)
      })

      it('should handle errors and return error response', async () => {
        const mockError = new Error('註冊失敗')
        mockContext.req.json = jest.fn().mockResolvedValue({})
        mockAuthService.register = jest.fn().mockRejectedValue(mockError)

        await controller.register(mockContext)

        expect(mockContext.json).toHaveBeenCalledWith({ success: false, error: '註冊失敗' }, 400)
      })
    })

    describe('login', () => {
      it('should call authService.login and return success response', async () => {
        const mockData = { email: 'test@example.com', password: 'password' }
        const mockResult = { token: 'test-token', user: { id: '123', email: 'test@example.com', name: 'Test User', role: 'USER' } }
        
        mockContext.req.json = jest.fn().mockResolvedValue(mockData)
        mockAuthService.login = jest.fn().mockResolvedValue(mockResult)

        await controller.login(mockContext)

        expect(mockContext.req.json).toHaveBeenCalled()
        expect(mockAuthService.login).toHaveBeenCalledWith(mockData)
        expect(mockContext.json).toHaveBeenCalledWith({ success: true, data: mockResult }, 200)
      })
    })

    describe('verify', () => {
      it('should call authService.verifyToken and return success response', async () => {
        const mockResult = { token: 'test-token', user: { id: '123', email: 'test@example.com', name: 'Test User', role: 'USER' } }
        
        mockAuthService.verifyToken = jest.fn().mockResolvedValue(mockResult)

        await controller.verify(mockContext)

        expect(mockAuthService.verifyToken).toHaveBeenCalledWith('test-token')
        expect(mockContext.json).toHaveBeenCalledWith({ success: true, data: mockResult }, 200)
      })
    })

    describe('updateProfile', () => {
      it('should call authService.updateProfile and return success response', async () => {
        const mockData = { name: 'Updated Name' }
        const mockResult = { token: 'test-token', user: { id: '123', email: 'test@example.com', name: 'Updated Name', role: 'USER' } }
        
        mockContext.req.json = jest.fn().mockResolvedValue(mockData)
        mockAuthService.updateProfile = jest.fn().mockResolvedValue(mockResult)

        await controller.updateProfile(mockContext)

        expect(mockContext.req.json).toHaveBeenCalled()
        expect(mockAuthService.updateProfile).toHaveBeenCalledWith('user-id', mockData)
        expect(mockContext.json).toHaveBeenCalledWith({ success: true, data: mockResult }, 200)
      })
    })
  })
})