import { BaseService } from './base.service'
import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'
import type { User } from '@prisma/client'
import { AuthResult, LoginInput, RegisterInput } from '@/types'


export class AuthService extends BaseService {
  private readonly JWT_EXPIRES_IN = '7d' // token 效期 7 天
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'secret'
  async register({ email, password, name }: RegisterInput): Promise<AuthResult> {
    const existingUser = await this.prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      throw new Error('該信箱已被註冊')
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await this.prisma.user.create({
      data: { email, password: hashedPassword, name }
    })

    return this.generateAuthResponse(user)
  }

  async login({ email, password }: LoginInput): Promise<AuthResult> {
    const user = await this.prisma.user.findUnique({ where: { email } })
    if (!user) {
      throw new Error('帳號或密碼錯誤')
    }

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      throw new Error('帳號或密碼錯誤')
    }

    return this.generateAuthResponse(user)
  }

  private generateAuthResponse(user: User): AuthResult {
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        name: user.name,
        role: user.role
       },
      this.JWT_SECRET,
      { expiresIn: this.JWT_EXPIRES_IN }
    )

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    }
  }

  async verifyToken(token: string): Promise<AuthResult> {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as jwt.JwtPayload
      const user = await this.prisma.user.findUnique({ where: { id: decoded.id } })
      if (!user) {
        throw new Error('用戶不存在')
      }

      // 更新最後登入時間
      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      })

      return this.generateAuthResponse(user)
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token 已過期')
      }
      throw new Error('Token 無效')
    }
  }
}