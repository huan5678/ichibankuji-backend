import { BaseService } from "./base.service";
import type { DrawRecord, DrawSet, Prisma, Prize, User } from "@prisma/client";

type DrawRecordWithRelations = DrawRecord & {
  Prize: Prize
}

export class DrawRecordService extends BaseService {
  async execute(userId: string, drawSetId: string, selectedNumber: number): Promise<DrawRecordWithRelations> {
    // 檢查抽獎套組
    const drawSet = await this.prisma.drawSet.findUnique({
      where: { id: drawSetId },
      include: {
        DrawSetPrizes: {
          where: { number: selectedNumber },
          include: { Prize: true }
        }
      }
    })

    if (!drawSet) throw new Error('找不到抽獎套組')
    if (!drawSet.enabled) throw new Error('抽獎套組已關閉')
    if (drawSet.DrawSetPrizes.length === 0) throw new Error('選擇的號碼無效')

    const selectedPrize = drawSet.DrawSetPrizes[0]
    if (selectedPrize.remaining <= 0) throw new Error('此號碼獎品已抽完')
    if (!selectedPrize.Prize.isActive) throw new Error('此獎品已停用')

    // 檢查用戶
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user?.isActive) throw new Error('用戶狀態異常')
    if (user.credits < drawSet.price) throw new Error('點數不足')

    // 檢查抽獎次數
    const drawCount = await this.prisma.drawRecord.count({
      where: { userId, drawSetId }
    })

    if (drawCount >= drawSet.maxDraws) throw new Error('已達最大抽獎次數')

    // 執行抽獎
    return await this.prisma.$transaction(async (tx) => {
      // 扣除獎品數量
      await tx.drawSetPrize.update({
        where: { id: selectedPrize.id },
        data: { remaining: { decrement: 1 } }
      })

      // 扣除點數
      await tx.user.update({
        where: { id: userId },
        data: { credits: { decrement: drawSet.price } }
      })

      // 建立抽獎紀錄
      return tx.drawRecord.create({
        data: {
          userId,
          drawSetId,
          prizeId: selectedPrize.Prize.id,
          drawNumber: selectedNumber,
          status: 'success'
        },
        include: {
          Prize: true,
          DrawSet: true,
          User: true
        }
      })
    })
  }

  async getHistory(userId: string): Promise<DrawRecordWithRelations[]> {
    return this.prisma.drawRecord.findMany({
      where: { userId },
      include: {
        Prize: true,
        DrawSet: true,
        User: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async getDrawSetHistory(drawSetId: string): Promise<DrawRecordWithRelations[]> {
    return this.prisma.drawRecord.findMany({
      where: { drawSetId },
      include: {
        Prize: true,
        User: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}
