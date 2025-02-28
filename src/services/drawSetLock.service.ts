import { PrismaClient } from "@prisma/client";
import { logger } from "@/utils/logger";

export class DrawSetLockService {
	private prisma: PrismaClient;
	private lockDuration: number; // 鎖定持續時間（毫秒）

	constructor(prisma: PrismaClient = new PrismaClient(), lockDuration = 60000) {
		this.prisma = prisma;
		this.lockDuration = lockDuration;
	}

	/**
	 * 嘗試鎖定抽獎套組
	 */
	async acquireLock(drawSetId: string, userId: string): Promise<boolean> {
		try {
			logger.debug(`嘗試鎖定抽獎套組: ${drawSetId}，用戶: ${userId}`);

			// 檢查套組是否已被鎖定
			const existingLock = await this.prisma.drawSet_Lock.findFirst({
				where: { drawSetId },
			});

			const now = new Date();

			// 如果有現有鎖定，檢查是否過期或屬於當前用戶
			if (existingLock) {
				// 如果鎖定已經過期
				if (existingLock.expiresAt < now) {
					logger.debug(`鎖定已過期，刪除舊鎖定並創建新鎖定: ${drawSetId}`);
					// 刪除過期鎖定
					await this.prisma.drawSet_Lock.delete({
						where: { id: existingLock.id },
					});
				}
				// 如果鎖定屬於當前用戶，延長鎖定時間
				else if (existingLock.userId === userId) {
					logger.debug(`延長用戶已有的鎖定: ${drawSetId}`);
					const expiresAt = new Date(now.getTime() + this.lockDuration);

					await this.prisma.drawSet_Lock.update({
						where: { id: existingLock.id },
						data: { expiresAt },
					});

					return true;
				}
				// 鎖定被其他用戶持有且未過期
				else {
					logger.debug(`鎖定被其他用戶持有: ${existingLock.userId}`);
					return false;
				}
			}

			// 創建新的鎖定
			const expiresAt = new Date(now.getTime() + this.lockDuration);

			await this.prisma.drawSet_Lock.create({
				data: {
					drawSetId,
					userId,
					expiresAt,
				},
			});

			logger.debug(`成功鎖定抽獎套組: ${drawSetId}`);
			return true;
		} catch (error) {
			logger.error(`鎖定抽獎套組失敗: ${drawSetId}`, error);
			return false;
		}
	}

	/**
	 * 釋放抽獎套組的鎖定
	 */
	async releaseLock(drawSetId: string, userId: string): Promise<boolean> {
		try {
			logger.debug(`嘗試釋放鎖定: ${drawSetId}, 用戶: ${userId}`);

			const existingLock = await this.prisma.drawSet_Lock.findFirst({
				where: {
					drawSetId,
					userId,
				},
			});

			if (!existingLock) {
				logger.debug(`沒有找到用戶持有的鎖定: ${drawSetId}`);
				return false;
			}

			await this.prisma.drawSet_Lock.delete({
				where: { id: existingLock.id },
			});

			logger.debug(`成功釋放鎖定: ${drawSetId}`);
			return true;
		} catch (error) {
			logger.error(`釋放鎖定失敗: ${drawSetId}`, error);
			return false;
		}
	}

	/**
	 * 檢查抽獎套組是否被鎖定
	 */
	async isLocked(
		drawSetId: string,
		userId?: string,
	): Promise<{ locked: boolean; ownedByCurrentUser: boolean }> {
		try {
			const now = new Date();

			const existingLock = await this.prisma.drawSet_Lock.findFirst({
				where: { drawSetId },
			});

			if (!existingLock || existingLock.expiresAt < now) {
				return { locked: false, ownedByCurrentUser: false };
			}

			const ownedByCurrentUser = userId
				? existingLock.userId === userId
				: false;

			return { locked: true, ownedByCurrentUser };
		} catch (error) {
			logger.error(`檢查鎖定狀態失敗: ${drawSetId}`, error);
			return { locked: false, ownedByCurrentUser: false };
		}
	}

	/**
	 * 清理過期的鎖定記錄
	 */
	async cleanupExpiredLocks(): Promise<number> {
		try {
			const now = new Date();

			const result = await this.prisma.drawSet_Lock.deleteMany({
				where: {
					expiresAt: {
						lt: now,
					},
				},
			});

			logger.debug(`已清理 ${result.count} 個過期鎖定`);
			return result.count;
		} catch (error) {
			logger.error("清理過期鎖定失敗", error);
			return 0;
		}
	}
}
