import { Context } from 'hono'
import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'
import { BaseController } from './base.controller'
import type { AuthResponse } from '@/types'

export class AuthController extends BaseController {
  async register(c: Context) {
    try {
      const { email, password, name } = await c.req.json()
      
      const existingUser = await this.prisma.user.findUnique({ where: { email } })
      if (existingUser) {
        return this.error(c, '該信箱已被註冊')
      }

      const hashedPassword = await bcrypt.hash(password, 10)
      const user = await this.prisma.user.create({
        data: { email, password: hashedPassword, name }
      })

      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        process.env.JWT_SECRET || 'secret'
      )

      const response: AuthResponse = {
        token,
        user: { id: user.id, email: user.email, name: user.name }
      }

      return this.success(c, response)
    } catch (error) {
      return this.error(c, '註冊失敗')
    }
  }

  async login(c: Context) {
    try {
      const { email, password } = await c.req.json()
      
      const user = await this.prisma.user.findUnique({ where: { email } })
      if (!user) {
        return this.error(c, '帳號或密碼錯誤', 401)
      }

      const isValid = await bcrypt.compare(password, user.password)
      if (!isValid) {
        return this.error(c, '帳號或密碼錯誤', 401)
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        process.env.JWT_SECRET || 'secret'
      )

      const response: AuthResponse = {
        token,
        user: { id: user.id, email: user.email, name: user.name }
      }

      return this.success(c, response)
    } catch (error) {
      return this.error(c, '登入失敗')
    }
  }
}