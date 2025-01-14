import { CreateDrawSetPrizeInput } from '@/schemas/drawSetPrize.schema'
import { BaseService } from './base.service'
import type { DrawSet, DrawSetPrize, Prize, Rarity } from '@prisma/client'

type DrawSetPrizeWithRelations = DrawSetPrize & {
  Prize: Prize
  DrawSet: DrawSet
}

export class DrawSetPrizeService extends BaseService {
  async create(data: CreateDrawSetPrizeInput): Promise<DrawSetPrizeWithRelations> {
    const drawSet = await this.prisma.drawSet.findUnique({
      where: { id: data.drawSetId }
    })

    if (!drawSet) {
      throw new Error('找不到抽獎套組')
    }

    if (drawSet.startTime <= new Date()) {
      throw new Error('抽獎已開始，無法修改獎品')
    }

    // 檢查編號是否已被使用
    const existingNumber = await this.prisma.drawSetPrize.findFirst({
      where: {
        drawSetId: data.drawSetId,
        number: data.number
      }
    })

    if (existingNumber) {
      throw new Error('此編號已被使用')
    }

    return this.prisma.drawSetPrize.create({
      data: {
        ...data,
        number: data.number ?? 0,
        quantity: data.quantity ?? 0,
        remaining: data.quantity ?? 0
      },
      include: {
        DrawSet: true,
        Prize: true
      }
    })
  }

  async batchCreate(
    drawSetId: string, 
    prizes: Array<Omit<CreateDrawSetPrizeInput, 'drawSetId'>>
  ): Promise<DrawSetPrizeWithRelations[]> {
    const drawSet = await this.prisma.drawSet.findUnique({
      where: { id: drawSetId }
    })

    if (!drawSet) {
      throw new Error('找不到抽獎套組')
    }

    if (drawSet.startTime <= new Date()) {
      throw new Error('抽獎已開始，無法修改獎品')
    }

    // 驗證編號是否重複
    const numbers = prizes.map(p => p.number)
    if (new Set(numbers).size !== numbers.length) {
      throw new Error('獎品編號不能重複')
    }

    return this.prisma.$transaction(
      prizes.map(prize => 
        this.prisma.drawSetPrize.create({
          data: {
            drawSetId,
            ...prize,
            number: prize.number ?? 0,
            quantity: prize.quantity ?? 0,
            remaining: prize.quantity ?? 0
          },
          include: {
            DrawSet: true,
            Prize: true
          }
        })
      )
    )
  }

  // 自動分配編號
  async autoAssignNumbers(drawSetId: string): Promise<void> {
    const prizes = await this.prisma.drawSetPrize.findMany({
      where: { drawSetId }
    })

    const numbers = Array.from(
      { length: prizes.length }, 
      (_, i) => i + 1
    )
    
    // Fisher-Yates shuffle
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]]
    }

    await this.prisma.$transaction(
      prizes.map((prize, idx) =>
        this.prisma.drawSetPrize.update({
          where: { id: prize.id },
          data: { number: numbers[idx] }
        })
      )
    )
  }

  async findByDrawSetId(drawSetId: string): Promise<DrawSetPrizeWithRelations[]> {
    return this.prisma.drawSetPrize.findMany({
      where: { drawSetId },
      include: {
        Prize: true,
        DrawSet: true
      }
    })
  }

  async findByPrizeId(prizeId: string): Promise<DrawSetPrizeWithRelations[]> {
    return this.prisma.drawSetPrize.findMany({
      where: { prizeId },
      include: {
        Prize: true,
        DrawSet: true
      }
    })
  }

  async updateRarity(id: string, rarity: Rarity): Promise<DrawSetPrizeWithRelations> {
    const existing = await this.prisma.drawSetPrize.findUnique({
      where: { id },
      include: { DrawSet: true }
    })

    if (!existing) {
      throw new Error('找不到獎品關係')
    }

    if (existing.DrawSet.startTime <= new Date()) {
      throw new Error('抽獎已開始，無法修改稀有度')
    }

    return this.prisma.drawSetPrize.update({
      where: { id },
      data: { rarity },
      include: {
        DrawSet: true,
        Prize: true
      }
    })
  }

  async remove(id: string): Promise<void> {
    const existing = await this.prisma.drawSetPrize.findUnique({
      where: { id },
      include: { DrawSet: true }
    })

    if (!existing) {
      throw new Error('找不到獎品關係')
    }

    if (existing.DrawSet.startTime <= new Date()) {
      throw new Error('抽獎已開始，無法移除獎品')
    }

    await this.prisma.drawSetPrize.delete({ where: { id } })
  }

  async deleteByDrawSetId(drawSetId: string): Promise<void> {
    await this.prisma.drawSetPrize.deleteMany({
      where: { drawSetId }
    })
  }
}