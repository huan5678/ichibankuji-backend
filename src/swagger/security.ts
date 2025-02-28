import type { SwaggerSecurityScheme } from "@/types/swagger";

// Swagger 安全機制定義
export const swaggerSecuritySchemes: Record<string, SwaggerSecurityScheme> = {
	bearerAuth: {
		type: "http" as const,
		scheme: "bearer",
		bearerFormat: "JWT",
		description: "使用 JWT Token 進行認證",
	},
};
