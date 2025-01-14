import { z } from "zod"
import { rarityEnum } from "./rarity.schema"

export const addPrizeSchema = z.object({
  drawSetId: z.string().uuid('必須是有效的抽獎套組 ID'),
  prizeId: z.string().uuid('必須是有效的獎品 ID'),
  rarity: rarityEnum,
})

export type AddPrizeInput = z.infer<typeof addPrizeSchema>
