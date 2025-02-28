import { Hono } from 'hono'
import { swaggerUI } from '@hono/swagger-ui'
import AuthRoute from './auth.route'
import DrawSetRoute from './drawSet.route'
import DrawRoute from './draw.route'
import PrizeRoute from './prize.route'
import DrawSetPrizeRoute from './drawSetPrize.route'
import {
	securityHeaders,
	rateLimiter,
} from "@/middlewares/security.middleware";
import { requestLogger } from "@/middlewares/logger.middleware";
import { errorHandler } from "@/middlewares/errorHandler.middleware";

const router = new Hono()

// 設置 Swagger UI
router.get(
  '/docs',
  swaggerUI({
    url: '/api/docs.json'
  })
)

// 設置 OpenAPI 文件
router.get('/docs.json', (c) => {
  return c.json({
			openapi: "3.0.0",
			info: {
				title: "Ichiban Kuji API",
				version: "1.0.0",
				description: "一番賞抽獎系統 API 文件",
			},
			servers: [
				{
					url: "/api",
					description: "API 伺服器",
				},
			],
			tags: [
				{ name: "認證", description: "使用者認證相關 API" },
				{ name: "抽獎套組", description: "抽獎套組管理 API" },
				{ name: "獎品", description: "獎品管理 API" },
				{ name: "抽獎", description: "抽獎操作 API" },
				{ name: "套組獎品", description: "抽獎套組獎品關聯 API" },
			],
			paths: {
				"/api/auth/register": {
					post: {
						summary: "用戶註冊",
						tags: ["認證"],
						requestBody: {
							content: {
								"application/json": {
									schema: {
										type: "object",
										properties: {
											email: { type: "string", format: "email" },
											password: { type: "string", minLength: 6 },
											name: { type: "string", minLength: 2 },
										},
										required: ["email", "password", "name"],
									},
								},
							},
						},
						responses: {
							"200": {
								description: "註冊成功",
								content: {
									"application/json": {
										schema: {
											type: "object",
											properties: {
												success: { type: "boolean" },
												data: {
													type: "object",
													properties: {
														token: { type: "string" },
														user: {
															type: "object",
															properties: {
																id: { type: "string" },
																email: { type: "string" },
																name: { type: "string" },
																role: { type: "string" },
															},
														},
													},
												},
											},
										},
									},
								},
							},
							"400": {
								description: "無效的請求數據",
								content: {
									"application/json": {
										schema: {
											type: "object",
											properties: {
												success: { type: "boolean", example: false },
												error: { type: "string" },
											},
										},
									},
								},
							},
						},
					},
				},
				"/api/auth/login": {
					post: {
						summary: "用戶登入",
						tags: ["認證"],
						requestBody: {
							content: {
								"application/json": {
									schema: {
										type: "object",
										properties: {
											email: { type: "string", format: "email" },
											password: { type: "string" },
										},
										required: ["email", "password"],
									},
								},
							},
						},
						responses: {
							"200": {
								description: "登入成功",
								content: {
									"application/json": {
										schema: {
											type: "object",
											properties: {
												success: { type: "boolean", example: true },
												data: {
													type: "object",
													properties: {
														token: { type: "string" },
														user: {
															type: "object",
															properties: {
																id: { type: "string" },
																email: { type: "string" },
																name: { type: "string" },
																role: { type: "string" },
															},
														},
													},
												},
											},
										},
									},
								},
							},
							"401": {
								description: "登入失敗",
								content: {
									"application/json": {
										schema: {
											type: "object",
											properties: {
												success: { type: "boolean", example: false },
												error: {
													type: "string",
													example: "電子郵件或密碼不正確",
												},
											},
										},
									},
								},
							},
						},
					},
				},
				"/api/draw-sets": {
					get: {
						summary: "獲取所有抽獎套組",
						tags: ["抽獎套組"],
						security: [{ bearerAuth: [] }],
						responses: {
							"200": {
								description: "成功獲取套組列表",
								content: {
									"application/json": {
										schema: {
											type: "object",
											properties: {
												success: { type: "boolean", example: true },
												data: {
													type: "array",
													items: {
														type: "object",
														properties: {
															id: { type: "string" },
															name: { type: "string" },
															description: { type: "string" },
															image: { type: "string" },
															enabled: { type: "boolean" },
															maxDraws: { type: "integer" },
															price: { type: "integer" },
															startTime: {
																type: "string",
																format: "date-time",
															},
															endTime: { type: "string", format: "date-time" },
															createdAt: {
																type: "string",
																format: "date-time",
															},
															updatedAt: {
																type: "string",
																format: "date-time",
															},
														},
													},
												},
											},
										},
									},
								},
							},
							"401": {
								description: "未授權",
								content: {
									"application/json": {
										schema: {
											type: "object",
											properties: {
												success: { type: "boolean", example: false },
												error: { type: "string", example: "未授權" },
											},
										},
									},
								},
							},
						},
					},
					post: {
						summary: "創建新抽獎套組",
						tags: ["抽獎套組"],
						security: [{ bearerAuth: [] }],
						requestBody: {
							content: {
								"application/json": {
									schema: {
										type: "object",
										properties: {
											name: { type: "string" },
											description: { type: "string" },
											image: { type: "string" },
											enabled: { type: "boolean" },
											maxDraws: { type: "integer" },
											price: { type: "integer" },
											startTime: { type: "string", format: "date-time" },
											endTime: { type: "string", format: "date-time" },
										},
										required: ["name", "maxDraws", "price"],
									},
								},
							},
						},
						responses: {
							"200": {
								description: "成功創建套組",
								content: {
									"application/json": {
										schema: {
											type: "object",
											properties: {
												success: { type: "boolean", example: true },
												data: {
													type: "object",
													properties: {
														id: { type: "string" },
														name: { type: "string" },
														description: { type: "string" },
														image: { type: "string" },
														enabled: { type: "boolean" },
														maxDraws: { type: "integer" },
														price: { type: "integer" },
														startTime: { type: "string", format: "date-time" },
														endTime: { type: "string", format: "date-time" },
														createdAt: { type: "string", format: "date-time" },
														updatedAt: { type: "string", format: "date-time" },
													},
												},
											},
										},
									},
								},
							},
						},
					},
				},
				"/api/prizes": {
					get: {
						summary: "獲取所有獎品",
						tags: ["獎品"],
						security: [{ bearerAuth: [] }],
						responses: {
							"200": {
								description: "成功獲取獎品列表",
								content: {
									"application/json": {
										schema: {
											type: "object",
											properties: {
												success: { type: "boolean", example: true },
												data: {
													type: "array",
													items: {
														type: "object",
														properties: {
															id: { type: "string" },
															name: { type: "string" },
															description: { type: "string" },
															image: { type: "string" },
															isActive: { type: "boolean" },
															createdAt: {
																type: "string",
																format: "date-time",
															},
															updatedAt: {
																type: "string",
																format: "date-time",
															},
														},
													},
												},
											},
										},
									},
								},
							},
						},
					},
				},
				"/api/draws": {
					post: {
						summary: "進行抽獎",
						tags: ["抽獎"],
						security: [{ bearerAuth: [] }],
						requestBody: {
							content: {
								"application/json": {
									schema: {
										type: "object",
										properties: {
											drawSetId: { type: "string" },
										},
										required: ["drawSetId"],
									},
								},
							},
						},
						responses: {
							"200": {
								description: "抽獎成功",
								content: {
									"application/json": {
										schema: {
											type: "object",
											properties: {
												success: { type: "boolean", example: true },
												data: {
													type: "object",
													properties: {
														id: { type: "string" },
														userId: { type: "string" },
														drawSetId: { type: "string" },
														prizeId: { type: "string" },
														drawNumber: { type: "integer" },
														status: { type: "string" },
														createdAt: { type: "string", format: "date-time" },
														updatedAt: { type: "string", format: "date-time" },
														prize: {
															type: "object",
															properties: {
																id: { type: "string" },
																name: { type: "string" },
																image: { type: "string" },
															},
														},
													},
												},
											},
										},
									},
								},
							},
							"400": {
								description: "抽獎失敗",
								content: {
									"application/json": {
										schema: {
											type: "object",
											properties: {
												success: { type: "boolean", example: false },
												error: { type: "string" },
											},
										},
									},
								},
							},
						},
					},
				},
			},
			components: {
				securitySchemes: {
					bearerAuth: {
						type: "http",
						scheme: "bearer",
						bearerFormat: "JWT",
					},
				},
			},
		});
})

// 註冊路由
router.route('/auth', AuthRoute)
router.route('/draw-sets', DrawSetRoute)
router.route('/prizes', PrizeRoute)
router.route('/draws', DrawRoute)
router.route('/draw-set-prizes', DrawSetPrizeRoute)

export function setupRoutes(app: Hono) {
	// 全局中間件
	app.use("*", errorHandler());
	app.use("*", requestLogger());
	app.use("*", securityHeaders());

	// API 路由速率限制
	app.use("/api/*", rateLimiter(100, 60 * 1000)); // 每分鐘 100 個請求

	// 註冊各模塊路由
	app.route("/api/auth", AuthRoute);
	app.route("/api/draws", DrawRoute);
	app.route("/api/draw-sets", DrawSetRoute);
	app.route("/api/prizes", PrizeRoute);

	return app;
}

export default router
