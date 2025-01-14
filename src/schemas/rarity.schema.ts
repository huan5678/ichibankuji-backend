import { z } from 'zod'

export const rarityEnum = z.enum([
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'LAST',
])
export type RarityEnum = z.infer<typeof rarityEnum>