import { swaggerUI } from "@hono/swagger-ui";
import { swaggerInfo } from "./info";
import { swaggerSecuritySchemes } from "./security";
import { swaggerTags } from "./tags";
import type { Hono } from "hono";
import type { SwaggerDocument } from "@/types/swagger";
import { swaggerDefinitions } from "./definitions";

/**
 * 設置 Swagger 文檔
 * @param app Hono 應用實例
 * @returns 已配置 Swagger 的應用實例
 */
export function setupSwagger(app: Hono) {
	// 設置 Swagger UI 路由
	app.get("/swagger", swaggerUI({ url: "/api/docs.json" }));

	// 設置 Swagger JSON 文檔路由
	app.get("/api/docs.json", (c) => {
		// 建立 OpenAPI 文檔
		const document: SwaggerDocument = {
			openapi: "3.0.0",
			info: swaggerInfo,
			servers: [
				{
					url:
						process.env.NODE_ENV === "production"
							? "https://api.ichibankuji.example.com"
							: "http://localhost:3000",
					description:
						process.env.NODE_ENV === "production"
							? "Production Server"
							: "Development Server",
				},
			],
			paths: {},
			tags: swaggerTags,
			components: {
				securitySchemes: swaggerSecuritySchemes,
				schemas: swaggerDefinitions,
			},
		};

		return c.json(document);
	});

	return app;
}
