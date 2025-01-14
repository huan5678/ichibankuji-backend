import { z } from 'zod'

export const createDrawSetSchema = z.object({
  name: z.string().min(1, '名稱不能為空'),
  description: z.string(),
  price: z.number().min(0, '價格不能為負數'),
  maxDraws: z.number().min(1, '最少需要 1 次抽獎機會'),
  startTime: z.string().datetime(),
  endTime: z.string().datetime()
})

export const executeDrawSchema = z.object({
  drawSetId: z.string().min(1, '抽獎套組 ID 不能為空')
})

export type CreateDrawSetInput = z.infer<typeof createDrawSetSchema>
export type ExecuteDrawInput = z.infer<typeof executeDrawSchema>