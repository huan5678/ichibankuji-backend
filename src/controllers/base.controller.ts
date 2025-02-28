import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { BaseService } from "@/services";
import type { PaginatedResult, PaginationParams } from "@/types";
import { ZodError } from "zod";

// 定義錯誤類型
export enum ErrorType {
	VALIDATION = "validation_error",
	NOT_FOUND = "not_found",
	UNAUTHORIZED = "unauthorized",
	FORBIDDEN = "forbidden",
	CONFLICT = "conflict",
	INTERNAL = "internal_error",
	BAD_REQUEST = "bad_request",
}

// 定義錯誤回應介面
interface ErrorResponse {
	success: boolean;
	error: string;
	errorType: ErrorType;
	details?: unknown;
}

export abstract class BaseController {
	constructor(protected readonly service: BaseService) {}

	protected success<T>(ctx: Context, data: T, status = 200) {
		return ctx.json({ success: true, data }, status as ContentfulStatusCode);
	}

	protected error(
		ctx: Context,
		message: string,
		status = 400,
		errorType: ErrorType = ErrorType.BAD_REQUEST,
		details?: unknown,
	) {
		const errorResponse: ErrorResponse = {
			success: false,
			error: message,
			errorType,
		};

		// 只在非生產環境添加詳細錯誤信息
		if (process.env.NODE_ENV !== "production" && details) {
			errorResponse.details = details;
		}

		return ctx.json(errorResponse, status as ContentfulStatusCode);
	}

	protected async handleRequest<T>(
		ctx: Context,
		action: () => Promise<T>,
		errorMessage = "操作失敗",
	) {
		try {
			const result = await action();
			return this.success(ctx, result);
		} catch (error) {
			console.error(`[ERROR] ${ctx.req.method} ${ctx.req.path}:`, error);

			// 處理不同類型的錯誤
			if (error instanceof ZodError) {
				// 處理驗證錯誤
				return this.error(
					ctx,
					"資料驗證失敗",
					400,
					ErrorType.VALIDATION,
					error.errors,
				);
			}

			if (error instanceof Error) {
				// 根據錯誤消息判斷錯誤類型
				if (
					error.message.includes("not found") ||
					error.message.includes("找不到")
				) {
					return this.error(ctx, error.message, 404, ErrorType.NOT_FOUND);
				}

				if (
					error.message.includes("unauthorized") ||
					error.message.includes("未授權")
				) {
					return this.error(ctx, error.message, 401, ErrorType.UNAUTHORIZED);
				}

				if (
					error.message.includes("forbidden") ||
					error.message.includes("禁止")
				) {
					return this.error(ctx, error.message, 403, ErrorType.FORBIDDEN);
				}

				if (
					error.message.includes("conflict") ||
					error.message.includes("衝突")
				) {
					return this.error(ctx, error.message, 409, ErrorType.CONFLICT);
				}

				// 一般錯誤
				return this.error(ctx, error.message, 400, ErrorType.BAD_REQUEST);
			}

			// 未知錯誤（內部伺服器錯誤）
			return this.error(
				ctx,
				process.env.NODE_ENV === "production" ? errorMessage : String(error),
				500,
				ErrorType.INTERNAL,
			);
		}
	}

	/**
	 * 從請求中提取分頁參數
	 */
	protected getPaginationParams(ctx: Context): PaginationParams {
		return {
			page: ctx.req.query("page")
				? Number.parseInt(ctx.req.query("page") || "1", 10)
				: 1,
			limit: ctx.req.query("limit")
				? Number.parseInt(ctx.req.query("limit") || "10", 10)
				: 10,
			sortBy: ctx.req.query("sortBy") || "createdAt",
			sortOrder: (ctx.req.query("sortOrder") || "desc") as "asc" | "desc",
		};
	}

	/**
	 * 創建分頁結果
	 */
	protected createPaginatedResult<T>(
		data: T[],
		total: number,
		{ page, limit }: PaginationParams,
	): PaginatedResult<T> {
		const totalPages = Math.ceil(total / (limit || 10));
		const currentPage = page || 1;

		return {
			data,
			pagination: {
				total,
				page: currentPage,
				limit: limit || 10,
				totalPages,
				hasNextPage: currentPage < totalPages,
				hasPrevPage: currentPage > 1,
			},
		};
	}
}
