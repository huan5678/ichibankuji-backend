import { BaseService } from './base.service'
import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'
import * as crypto from 'crypto'
import type { User, Role } from '@prisma/client'
import { AdminUserUpdateInput, AuthResult, LoginInput, PaginatedResult, RegisterInput, UpdateProfileInput } from '@/types'

// 暫存密碼重設 token 的集合 (實際環境應使用 Redis 或資料庫)
const passwordResetTokens: Map<string, { userId: string, expiresAt: Date }> = new Map()

export class AuthService extends BaseService {
  private readonly JWT_EXPIRES_IN = '7d' // token 效期 7 天
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'secret'
  private readonly RESET_TOKEN_EXPIRES = 60 * 60 * 1000 // 密碼重設 token 效期 1 小時
  
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

    if (!user.isActive) {
      throw new Error('帳號已被停用')
    }

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      throw new Error('帳號或密碼錯誤')
    }

    // 更新最後登入時間
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    })

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
        role: user.role,
        picture: user.picture || undefined,
        credits: user.credits,
        isActive: user.isActive
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

      if (!user.isActive) {
        throw new Error('帳號已被停用')
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

  async updateProfile(userId: string, data: UpdateProfileInput): Promise<AuthResult> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      throw new Error('用戶不存在')
    }

    const updateData: any = {}
    
    // 如果要更新密碼
    if (data.currentPassword && data.newPassword) {
      const isValid = await bcrypt.compare(data.currentPassword, user.password)
      if (!isValid) {
        throw new Error('當前密碼錯誤')
      }
      updateData.password = await bcrypt.hash(data.newPassword, 10)
    }

    // 更新其他資料
    if (data.name) updateData.name = data.name
    if (data.picture) updateData.picture = data.picture

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateData
    })

    return this.generateAuthResponse(updatedUser)
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { email } })
    if (!user) {
      // 即使用戶不存在也返回成功訊息，避免洩露用戶資訊
      return { message: '如果該信箱已註冊，我們已發送密碼重設信件' }
    }

    // 產生重設 token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + this.RESET_TOKEN_EXPIRES)
    
    // 儲存 token (實際環境應寫入資料庫或 Redis)
    passwordResetTokens.set(resetToken, { userId: user.id, expiresAt })

    // 實際環境應使用 Email 服務發送信件
    console.log(`密碼重設連結: /reset-password?token=${resetToken}`)

    return { message: '如果該信箱已註冊，我們已發送密碼重設信件' }
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const resetData = passwordResetTokens.get(token)
    if (!resetData) {
      throw new Error('無效或已過期的密碼重設連結')
    }

    if (resetData.expiresAt < new Date()) {
      passwordResetTokens.delete(token)
      throw new Error('密碼重設連結已過期')
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    
    await this.prisma.user.update({
      where: { id: resetData.userId },
      data: { password: hashedPassword }
    })

    // 使用過後刪除 token
    passwordResetTokens.delete(token)

    return { message: '密碼已成功重設，請使用新密碼登入' }
  }

  async getAllUsers(page: number = 1, limit: number = 10): Promise<PaginatedResult<User>> {
    const skip = (page - 1) * limit
    
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.user.count()
    ])

    return {
      data: users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id } })
    if (!user) {
      throw new Error('用戶不存在')
    }
    return user
  }

  async updateUserAsAdmin(id: string, data: AdminUserUpdateInput): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id } })
    if (!user) {
      throw new Error('用戶不存在')
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.role !== undefined && { role: data.role as Role }),
        ...(data.credits !== undefined && { credits: data.credits })
      }
    })
  }
}