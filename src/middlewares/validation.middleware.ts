import type { Context, Next } from "hono";
import type { ZodSchema } from "zod";
import { logger } from "@/utils/logger";

export function validateBody(schema: ZodSchema) {
	return async (c: Context, next: Next) => {
		try {
			const body = await c.req.json();
			const validated = schema.parse(body);

			// 將驗證後的數據附加到 Context
			c.set("validatedBody", validated);

			await next();
		} catch (error) {
			if (error instanceof Error) {
				logger.error("Body validation error", error);
				return c.json(
					{
						success: false,
						error: "請求資料驗證失敗",
						details:
							process.env.NODE_ENV !== "production" ? error.message : undefined,
					},
					400,
				);
			}
			throw error;
		}
	};
}

export function validateQuery(schema: ZodSchema) {
	return async (c: Context, next: Next) => {
		try {
			const query = c.req.query();
			const validated = schema.parse(query);

			// 將驗證後的數據附加到 Context
			c.set("validatedQuery", validated);

			await next();
		} catch (error) {
			if (error instanceof Error) {
				logger.error("Query validation error", error);
				return c.json(
					{
						success: false,
						error: "請求參數驗證失敗",
						details:
							process.env.NODE_ENV !== "production" ? error.message : undefined,
					},
					400,
				);
			}
			throw error;
		}
	};
}

export function validateParams(schema: ZodSchema) {
	return async (c: Context, next: Next) => {
		try {
			const params = c.req.param();
			const validated = schema.parse(params);

			// 將驗證後的數據附加到 Context
			c.set("validatedParams", validated);

			await next();
		} catch (error) {
			if (error instanceof Error) {
				logger.error("Params validation error", error);
				return c.json(
					{
						success: false,
						error: "路徑參數驗證失敗",
						details:
							process.env.NODE_ENV !== "production" ? error.message : undefined,
					},
					400,
				);
			}
			throw error;
		}
	};
}
