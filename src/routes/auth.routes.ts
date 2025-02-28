import { Hono } from "hono";
import { AuthController } from "@/controllers";
import { validateBody } from "@/middlewares/validation.middleware";
import { loginSchema, registerSchema, updateProfileSchema } from "@/schemas";
import { jwtAuth } from "@/middlewares/auth.middleware";

const routes = new Hono();
const controller = new AuthController();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: ['auth']
 *     summary: 用戶註冊
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterSchema'
 *     responses:
 *       200:
 *         description: 註冊成功
 *       400:
 *         description: 請求資料無效
 */
routes.post(
	"/register",
	validateBody(registerSchema),
	controller.register.bind(controller),
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: ['auth']
 *     summary: 用戶登錄
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginSchema'
 *     responses:
 *       200:
 *         description: 登錄成功
 *       401:
 *         description: 登錄失敗
 */
routes.post(
	"/login",
	validateBody(loginSchema),
	controller.login.bind(controller),
);

/**
 * @swagger
 * /api/auth/verify:
 *   get:
 *     tags: ['auth']
 *     summary: 驗證 JWT Token
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token 有效
 *       401:
 *         description: Token 無效
 */
routes.get("/verify", jwtAuth(), controller.verify.bind(controller));

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     tags: ['auth']
 *     summary: 更新用戶資料
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfileSchema'
 *     responses:
 *       200:
 *         description: 更新成功
 *       401:
 *         description: 未授權
 */
routes.put(
	"/profile",
	jwtAuth(),
	validateBody(updateProfileSchema),
	controller.updateProfile.bind(controller),
);

export { routes as authRoutes };
