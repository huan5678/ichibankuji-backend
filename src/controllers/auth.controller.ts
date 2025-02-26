import { Context } from 'hono'
import { BaseController } from './base.controller'
import { AuthService } from '@/services'

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

  async updateProfile(c: Context) {
    return this.handleRequest(c, async () => {
      const jwt = c.get('jwtPayload')
      const userId = jwt.id
      const data = await c.req.json()
      return this.authService.updateProfile(userId, data)
    }, '更新個人資料失敗')
  }

  async forgotPassword(c: Context) {
    return this.handleRequest(c, async () => {
      const { email } = await c.req.json()
      return this.authService.forgotPassword(email)
    }, '密碼重設請求失敗')
  }

  async resetPassword(c: Context) {
    return this.handleRequest(c, async () => {
      const { token, password } = await c.req.json()
      return this.authService.resetPassword(token, password)
    }, '密碼重設失敗')
  }

  async getAllUsers(c: Context) {
    return this.handleRequest(c, async () => {
      const page = Number(c.req.query('page') || '1')
      const limit = Number(c.req.query('limit') || '10')
      return this.authService.getAllUsers(page, limit)
    }, '取得用戶列表失敗')
  }

  async getUserById(c: Context) {
    return this.handleRequest(c, async () => {
      const userId = c.req.param('id')
      return this.authService.getUserById(userId)
    }, '取得用戶資料失敗')
  }

  async updateUserAsAdmin(c: Context) {
    return this.handleRequest(c, async () => {
      const userId = c.req.param('id')
      const data = await c.req.json()
      return this.authService.updateUserAsAdmin(userId, data)
    }, '更新用戶資料失敗')
  }
}