import type { Context, Next } from "hono";
import { logger } from "@/utils/logger";

export function securityHeaders() {
	return async (c: Context, next: Next) => {
		await next();

		// 設置安全性標頭
		c.header("X-Content-Type-Options", "nosniff");
		c.header("X-Frame-Options", "DENY");
		c.header("X-XSS-Protection", "1; mode=block");
		c.header(
			"Strict-Transport-Security",
			"max-age=31536000; includeSubDomains",
		);
		c.header("Content-Security-Policy", "default-src 'self'");
		c.header("Referrer-Policy", "strict-origin-when-cross-origin");
		c.header("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
	};
}

export function rateLimiter(limit: number, windowMs: number) {
	// 使用 Map 實現簡易的速率限制器
	const requestCounts = new Map<string, { count: number; resetTime: number }>();

	// 定期清理過期的計數
	setInterval(() => {
		const now = Date.now();
		for (const [ip, data] of requestCounts.entries()) {
			if (now > data.resetTime) {
				requestCounts.delete(ip);
			}
		}
	}, windowMs);

	return async (c: Context, next: Next) => {
		const ip = c.req.header("x-forwarded-for") || "unknown";
		const now = Date.now();

		let record = requestCounts.get(ip);

		if (!record || now > record.resetTime) {
			record = { count: 0, resetTime: now + windowMs };
			requestCounts.set(ip, record);
		}

		record.count += 1;

		if (record.count > limit) {
			logger.warn(`速率限制觸發: ${ip}, 請求數: ${record.count}/${limit}`);
			return c.json(
				{
					success: false,
					error: "請求過於頻繁，請稍後再試",
					errorType: "rate_limit",
				},
				429,
			);
		}

		return next();
	};
}
