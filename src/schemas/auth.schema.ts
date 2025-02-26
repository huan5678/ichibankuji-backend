import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email('無效的 Email 格式'),
  password: z.string().min(6, '密碼至少需要 6 個字元'),
  name: z.string().min(2, '名稱至少需要 2 個字元')
})

export const loginSchema = z.object({
  email: z.string().email('無效的 Email 格式'),
  password: z.string().min(6, '密碼至少需要 6 個字元')
})

export const updateProfileSchema = z.object({
  name: z.string().min(2, '名稱至少需要 2 個字元').optional(),
  picture: z.string().url('無效的圖片網址').optional(),
  currentPassword: z.string().min(6, '密碼至少需要 6 個字元').optional(),
  newPassword: z.string().min(6, '密碼至少需要 6 個字元').optional(),
}).refine(data => {
  // 如果提供了新密碼，必須也提供當前密碼
  return !(data.newPassword && !data.currentPassword);
}, {
  message: '變更密碼時必須提供當前密碼',
  path: ['currentPassword']
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('無效的 Email 格式')
})

export const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(6, '密碼至少需要 6 個字元')
})

export const adminUserUpdateSchema = z.object({
  isActive: z.boolean().optional(),
  role: z.enum(['USER', 'ADMIN']).optional(),
  credits: z.number().int().nonnegative().optional()
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type AdminUserUpdateInput = z.infer<typeof adminUserUpdateSchema>