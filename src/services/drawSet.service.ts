import { BaseService } from './base.service'
import type { DrawSet, Prisma } from '@prisma/client'

export class DrawSetService extends BaseService {
  async create(data: Prisma.DrawSetCreateInput): Promise<DrawSet> {
    return this.prisma.drawSet.create({
      data: {
        ...data,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime)
      },
      include: {
        DrawSetPrizes: {
          include: { Prize: true }
        }
      }
    })
  }

  async findAll(): Promise<DrawSet[]> {
    return this.prisma.drawSet.findMany({
      include: {
        DrawSetPrizes: {
          include: { Prize: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  }

  async findById(id: string): Promise<DrawSet> {
    const drawSet = await this.prisma.drawSet.findUnique({
      where: { id },
      include: {
        DrawSetPrizes: {
          include: {
            Prize: true,
           }
        }
      }
    })

    if (!drawSet) {
      throw new Error('找不到抽獎套組')
    }

    return drawSet
  }

  async update(id: string, data: Prisma.DrawSetUpdateInput): Promise<DrawSet> {
    return this.prisma.drawSet.update({
      where: { id },
      data: {
        ...data,
        startTime: data.startTime instanceof Date ? new Date(data.startTime) : undefined,
        endTime: data.endTime instanceof Date ? new Date(data.endTime) : undefined
      },
      include: {
        DrawSetPrizes: {
          include: { Prize: true }
        }
      }
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.drawSetPrize.deleteMany({ where: { drawSetId: id } }),
      this.prisma.drawSet_Lock.deleteMany({ where: { drawSetId: id } }),
      this.prisma.drawSet.delete({ where: { id } })
    ])
  }
}