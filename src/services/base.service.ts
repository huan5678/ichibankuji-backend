import { PrismaClient } from "@prisma/client";
import { logger } from "@/utils/logger";

// 定義分頁相關型別
export interface PaginationParams {
	page?: number;
	limit?: number;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
}

export interface PaginatedResult<T> {
	data: T[];
	pagination: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
		hasNextPage: boolean;
		hasPrevPage: boolean;
	};
}

export class BaseService {
	protected prisma: PrismaClient;

	constructor(prisma: PrismaClient = new PrismaClient()) {
		this.prisma = prisma;
	}

	/**
	 * 建立分頁設定
	 */
	protected createPaginationOptions({
		page = 1,
		limit = 10,
		sortBy = "createdAt",
		sortOrder = "desc",
	}: PaginationParams) {
		const skip = (page - 1) * limit;
		const take = limit;
		const orderBy = { [sortBy]: sortOrder };

		return {
			skip,
			take,
			orderBy,
		};
	}

	/**
	 * 建立分頁結果
	 */
	protected createPaginatedResult<T>(
		data: T[],
		total: number,
		{ page = 1, limit = 10 }: PaginationParams,
	): PaginatedResult<T> {
		const totalPages = Math.ceil(total / limit);

		return {
			data,
			pagination: {
				total,
				page,
				limit,
				totalPages,
				hasNextPage: page < totalPages,
				hasPrevPage: page > 1,
			},
		};
	}

	/**
	 * 執行事務操作
	 */
	protected async transaction<T>(
		callback: (tx: PrismaClient) => Promise<T>,
	): Promise<T> {
		try {
			const result = await this.prisma.$transaction(async (tx) => {
				return await callback(tx as unknown as PrismaClient);
			});
			return result;
		} catch (error) {
			logger.error("Transaction failed", error);
			throw error;
		}
	}

	/**
	 * 優化查詢：根據條件選擇性包含關聯數據
	 */
	protected createIncludeOptions(
		include?: Record<string, boolean | object>,
	): object | undefined {
		if (!include) return undefined;
		return Object.entries(include).reduce(
			(acc, [key, value]) => {
				if (value) acc[key] = value === true ? true : value;
				return acc;
			},
			{} as Record<string, unknown>,
		);
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
		pagination: PaginationParams,
	): Promise<PaginatedResult<T>> {
		const page = pagination.page || 1;
		const limit = pagination.limit || 10;
		const skip = (page - 1) * limit;

		const [data, total] = await Promise.all([queryFn(skip, limit), countFn()]);
		const totalPages = Math.ceil(total / limit);

		return {
			data,
			pagination: {
				total,
				page,
				limit,
				totalPages,
				hasNextPage: page < totalPages,
				hasPrevPage: page > 1,
			},
		};
	}

	/**
	 * 格式化查詢參數中的日期範圍
	 * @param dateStr 日期字串 (YYYY-MM-DD)
	 * @param isStart 是否為開始日期
	 * @returns Date 物件
	 */
	protected formatDateRange(
		dateStr: string | undefined,
		isStart: boolean,
	): Date | undefined {
		if (!dateStr) return undefined;

		try {
			const date = new Date(dateStr);

			// 如果是開始日期，設為當日 00:00:00
			// 如果是結束日期，設為當日 23:59:59
			if (isStart) {
				date.setHours(0, 0, 0, 0);
			} else {
				date.setHours(23, 59, 59, 999);
			}

			return date;
		} catch (error) {
			return undefined;
		}
	}
}
