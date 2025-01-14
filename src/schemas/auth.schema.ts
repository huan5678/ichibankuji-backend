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

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>