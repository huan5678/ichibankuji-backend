import type { Context, Next } from "hono";
import { jwt } from "hono/jwt";
import { logger } from "@/utils/logger";
import { ErrorType } from "@/controllers/base.controller";

// 取得 JWT secret
const JWT_SECRET = process.env.JWT_SECRET || "default_secret_for_development";

// 用戶認證中間件
export function jwtAuth() {
	return async (c: Context, next: Next) => {
		try {
			// 使用 hono/jwt 進行 JWT 驗證
			const jwtMiddleware = jwt({
				secret: JWT_SECRET,
			});

			await jwtMiddleware(c, next);
		} catch (error) {
			logger.error("JWT 驗證失敗", error);
			return c.json(
				{
					success: false,
					error: "未授權或 Token 無效",
					errorType: ErrorType.UNAUTHORIZED,
				},
				401,
			);
		}
	};
}

// 管理員認證中間件
export function adminAuth() {
	// 首先使用 JWT 認證中間件
	const authMiddleware = jwt({ secret: JWT_SECRET });

	return async (c: Context, next: Next) => {
		try {
			// 執行 JWT 驗證
			await authMiddleware(c, async () => {});

			// 驗證成功後執行管理員檢查
			const payload = c.get("jwtPayload");

			// 檢查是否為管理員
			if (payload.role !== "ADMIN") {
				logger.warn(`用戶 ${payload.id} 嘗試存取管理員資源但權限不足`);
				return c.json(
					{
						success: false,
						error: "權限不足，需要管理員權限",
						errorType: ErrorType.FORBIDDEN,
					},
					403,
				);
			}

			// 只有管理員才能進入下一步
			return next();
		} catch (error) {
			logger.error("管理員驗證失敗", error);
			return c.json(
				{
					success: false,
					error: "管理員驗證失敗",
					errorType: ErrorType.UNAUTHORIZED,
				},
				401,
			);
		}
	};
}
