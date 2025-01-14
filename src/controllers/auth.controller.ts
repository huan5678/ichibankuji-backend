import { Context } from 'hono'
import { BaseController } from './base.controller'
import { AuthService } from '@/services/auth.service'

export class AuthController extends BaseController {
  constructor(private readonly authService: AuthService = new AuthService()) {
    super(authService)
  }

  async register(c: Context) {
    return this.handleRequest(c, async () => {
      const data = await c.req.json()
      return this.authService.register(data)
    }, '註冊失敗')
  }

  async login(c: Context) {
    return this.handleRequest(c, async () => {
      const data = await c.req.json()
      return this.authService.login(data)
    }, '登入失敗')
  }

  async verify(c: Context) {
    return this.handleRequest(c, async () => {
      const jwt = c.get('jwtPayload')
      return this.authService.verifyToken(jwt.token)
    }, 'Token 驗證失敗')
  }
}