import { number, z } from "zod"
import { rarityEnum } from "./rarity.schema"

export const createDrawSetPrizeSchema = z.object({
  drawSetId: z.string().uuid('必須是有效的抽獎套組 ID'),
  prizeId: z.string().uuid('必須是有效的獎品 ID'),
  rarity: rarityEnum,
  number: number().int().positive().optional(),
  quantity: number().int().positive().optional(),
})

export const addPrizeSchema = z.object({
  drawSetId: z.string().uuid('必須是有效的抽獎套組 ID'),
  prizeId: z.string().uuid('必須是有效的獎品 ID'),
  rarity: rarityEnum,
})

export const updatePrizeRaritySchema = z.object({
  drawSetId: z.string().uuid('無效的抽獎套組 ID'),
  prizeId: z.string().uuid('無效的獎品 ID'),
  rarity: z.enum(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'LAST'])
})

export type AddPrizeInput = z.infer<typeof addPrizeSchema>
export type UpdatePrizeRarityInput = z.infer<typeof updatePrizeRaritySchema>
export type CreateDrawSetPrizeInput = z.infer<typeof createDrawSetPrizeSchema>