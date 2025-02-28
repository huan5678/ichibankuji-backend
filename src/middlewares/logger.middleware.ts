import type { Context, Next } from "hono";
import { logger } from "@/utils/logger";

export function requestLogger() {
	return async (c: Context, next: Next) => {
		const startTime = performance.now();
		const { method, url } = c.req;
		const path = new URL(url).pathname;

		try {
			await next();

			const statusCode = c.res.status;
			const endTime = performance.now();
			const responseTime = Math.round(endTime - startTime);

			logger.request(method, path, statusCode, responseTime);
		} catch (error) {
			const endTime = performance.now();
			const responseTime = Math.round(endTime - startTime);

			logger.error(`Request failed: ${method} ${path}`, error);
			logger.request(method, path, 500, responseTime);

			throw error; // 讓錯誤繼續傳播以便被全局錯誤處理器捕獲
		}
	};
}
