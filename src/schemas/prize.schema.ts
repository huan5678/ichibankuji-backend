import { z } from 'zod'

export const createPrizeSchema = z.object({
  name: z.string().min(1, '名稱不能為空'),
  description: z.string().optional(),
  image: z.string().optional(),
  isActive: z.boolean().optional(),
})

export const updatePrizeSchema = createPrizeSchema.partial().extend({
  id: z.string().uuid('無效的獎品 ID'),
})

export type CreatePrizeInput = z.infer<typeof createPrizeSchema>
export type UpdatePrizeInput = z.infer<typeof updatePrizeSchema>