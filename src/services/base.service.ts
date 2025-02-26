import { PrismaClient } from '@prisma/client'
import { PaginatedResult, PaginationParams } from '@/types'

export abstract class BaseService {
  protected prisma: PrismaClient

  constructor() {
    this.prisma = new PrismaClient()
  }

  /**
   * 處理分頁查詢
   * @param queryFn 查詢函數
   * @param countFn 計數函數
   * @param pagination 分頁參數
   * @returns 分頁結果
   */
  protected async paginate<T>(
    queryFn: (skip: number, take: number) => Promise<T[]>,
    countFn: () => Promise<number>,
    pagination: PaginationParams
  ): Promise<PaginatedResult<T>> {
    const page = pagination.page || 1
    const limit = pagination.limit || 10
    const skip = (page - 1) * limit

    const [data, total] = await Promise.all([
      queryFn(skip, limit),
      countFn()
    ])

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  /**
   * 格式化查詢參數中的日期範圍
   * @param dateStr 日期字串 (YYYY-MM-DD)
   * @param isStart 是否為開始日期
   * @returns Date 物件
   */
  protected formatDateRange(dateStr: string | undefined, isStart: boolean): Date | undefined {
    if (!dateStr) return undefined

    try {
      const date = new Date(dateStr)
      
      // 如果是開始日期，設為當日 00:00:00
      // 如果是結束日期，設為當日 23:59:59
      if (isStart) {
        date.setHours(0, 0, 0, 0)
      } else {
        date.setHours(23, 59, 59, 999)
      }
      
      return date
    } catch (error) {
      return undefined
    }
  }
}
