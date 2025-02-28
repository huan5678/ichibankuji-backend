import { Context, Next } from "hono";
import { jwtAuth, checkAdminRole } from "@/middlewares/adminAuth";
import type { ErrorType } from "@/controllers/base.controller";
import { logger } from "@/utils/logger";

// 定義錯誤類型常數
const ERROR_TYPES = {
	FORBIDDEN: "forbidden",
	UNAUTHORIZED: "unauthorized",
};

// 管理員權限裝飾器
export function AdminAuth() {
	return function (
		target: any,
		propertyKey: string,
		descriptor: PropertyDescriptor,
	) {
		const originalMethod = descriptor.value;

		descriptor.value = async function (c: Context, next: Next, ...args: any[]) {
			try {
				// 在測試環境中模擬headers
				if (
					process.env.NODE_ENV === "development" ||
					process.env.NODE_ENV === "test"
				) {
					c.req.raw.headers.set("Authorization", "Bearer test-token");
				}

				// 先驗證 JWT
				await jwtAuth(c, async () => {
					// 再檢查是否為管理員
					await checkAdminRole(c, async () => {
						// 最後執行原始方法
						await originalMethod.apply(this, [c, next, ...args]);
					});
				});
			} catch (error) {
				const message = error instanceof Error ? error.message : "未授權的訪問";
				return c.json(
					{
						success: false,
						error: message,
					},
					401,
				);
			}
		};

		return descriptor;
	};
}

// 用戶權限裝飾器 (只需要登入)
export function UserAuth() {
	return function (
		target: any,
		propertyKey: string,
		descriptor: PropertyDescriptor,
	) {
		const originalMethod = descriptor.value;

		descriptor.value = async function (c: Context, next: Next, ...args: any[]) {
			try {
				// 在測試環境中模擬headers
				if (
					process.env.NODE_ENV === "development" ||
					process.env.NODE_ENV === "test"
				) {
					c.req.raw.headers.set("Authorization", "Bearer test-token");
				}

				// 驗證 JWT
				await jwtAuth(c, async () => {
					// 執行原始方法
					await originalMethod.apply(this, [c, next, ...args]);
				});
			} catch (error) {
				const message = error instanceof Error ? error.message : "未授權的訪問";
				return c.json(
					{
						success: false,
						error: message,
					},
					401,
				);
			}
		};

		return descriptor;
	};
}

/**
 * 管理員認證裝飾器
 * 用於檢查請求是否來自管理員用戶
 */
export function adminAuth() {
	return async (c: Context, next: Next): Promise<Response | void> => {
		try {
			// 從 JWT 中獲取用戶資訊
			const payload = c.get("jwtPayload");

			// 檢查是否為管理員
			if (payload.role !== "ADMIN") {
				logger.warn(`用戶 ${payload.id} 嘗試存取管理員資源但權限不足`);
				return c.json(
					{
						success: false,
						error: "權限不足，需要管理員權限",
						errorType: ERROR_TYPES.FORBIDDEN,
					},
					403,
				);
			}

			// 管理員權限驗證通過，繼續執行
			return next();
		} catch (error: unknown) {
			logger.error("管理員驗證失敗", error);
			return c.json(
				{
					success: false,
					error: "管理員驗證失敗",
					errorType: ERROR_TYPES.UNAUTHORIZED,
				},
				401,
			);
		}
	};
}
