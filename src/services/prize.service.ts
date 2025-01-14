import { BaseService } from './base.service'
import type { Prize, Prisma } from '@prisma/client'

export class PrizeService extends BaseService {
  async create(data: Prisma.PrizeCreateInput): Promise<Prize> {
    return this.prisma.prize.create({ data })
  }

  async findById(id: string): Promise<Prize | null> {
    return this.prisma.prize.findUnique({
      where: { id },
      include: { DrawSetPrizes: true }
    })
  }

  async update(id: string, data: Prisma.PrizeUpdateInput): Promise<Prize> {
    return this.prisma.prize.update({
      where: { id },
      data
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.prize.delete({ where: { id } })
  }
}
