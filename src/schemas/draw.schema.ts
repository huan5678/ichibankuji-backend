import { z } from 'zod'

// 執行抽獎的輸入驗證
export const executeDrawSchema = z.object({
  drawSetId: z.string().uuid('無效的抽獎套組 ID'),
  number: z.number().int().positive('編號必須是正整數').optional(),
})

// 查詢抽獎歷史的參數驗證
export const drawHistoryQuerySchema = z.object({
  drawSetId: z.string().uuid('無效的抽獎套組 ID').optional(),
  page: z.number().min(1, '頁碼必須大於 0').optional().default(1),
  limit: z.number().min(1, '每頁筆數必須大於 0').max(100).optional().default(20),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
})

// 抽獎結果型別
export const drawResultSchema = z.object({
  drawId: z.string().uuid(),
  prizeId: z.string().uuid(),
  prizeName: z.string(),
  drawSetId: z.string().uuid(),
  drawSetName: z.string(),
  timestamp: z.date(),
})

// 匯出型別定義
export type ExecuteDrawInput = z.infer<typeof executeDrawSchema>
export type DrawHistoryQuery = z.infer<typeof drawHistoryQuerySchema>
export type DrawResult = z.infer<typeof drawResultSchema>

// 分頁結果型別
export type PaginatedDrawHistory = {
  draws: DrawResult[]
  total: number
  page: number
  limit: number
  totalPages: number
}