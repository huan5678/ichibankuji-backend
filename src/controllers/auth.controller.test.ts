import { AuthController } from './auth.controller'
import { AuthService } from '@/services/auth.service'
import { BaseController } from './base.controller'

describe('AuthController', () => {
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
})