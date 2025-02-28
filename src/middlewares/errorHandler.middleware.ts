import type { Context, Next } from "hono";
import { logger } from "@/utils/logger";
import { ZodError } from "zod";
import { ErrorType } from "@/controllers/base.controller";

export function errorHandler() {
	return async (c: Context, next: Next) => {
		try {
			await next();
		} catch (error) {
			logger.error("Unhandled error", error);

			// 處理不同類型的錯誤
			if (error instanceof ZodError) {
				return c.json(
					{
						success: false,
						error: "資料驗證失敗",
						errorType: ErrorType.VALIDATION,
						details:
							process.env.NODE_ENV !== "production" ? error.errors : undefined,
					},
					400,
				);
			}

			if (error instanceof Error) {
				// 根據錯誤消息判斷錯誤類型
				const message = error.message;

				if (message.includes("not found") || message.includes("找不到")) {
					return c.json(
						{
							success: false,
							error: message,
							errorType: ErrorType.NOT_FOUND,
						},
						404,
					);
				}

				if (message.includes("unauthorized") || message.includes("未授權")) {
					return c.json(
						{
							success: false,
							error: message,
							errorType: ErrorType.UNAUTHORIZED,
						},
						401,
					);
				}

				if (message.includes("forbidden") || message.includes("禁止")) {
					return c.json(
						{
							success: false,
							error: message,
							errorType: ErrorType.FORBIDDEN,
						},
						403,
					);
				}

				return c.json(
					{
						success: false,
						error: message,
						errorType: ErrorType.BAD_REQUEST,
					},
					400,
				);
			}

			// 未知錯誤
			return c.json(
				{
					success: false,
					error: "伺服器內部錯誤",
					errorType: ErrorType.INTERNAL,
				},
				500,
			);
		}
	};
}
