import { AuthService } from "./auth.service";
import { PrismaClient } from "@prisma/client";
import type { User, Role } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// 模擬 Prisma 客戶端
jest.mock("@prisma/client", () => {
	const mockPrismaClient = {
		user: {
			findUnique: jest.fn(),
			create: jest.fn(),
			update: jest.fn(),
			findMany: jest.fn(),
		},
	};
	return {
		PrismaClient: jest.fn(() => mockPrismaClient),
		Role: {
			USER: "USER",
			ADMIN: "ADMIN",
		},
	};
});

// 模擬 bcrypt
jest.mock("bcrypt", () => ({
	hash: jest.fn(),
	compare: jest.fn(),
}));

// 模擬 jsonwebtoken
jest.mock("jsonwebtoken", () => ({
	sign: jest.fn(),
	verify: jest.fn(),
}));

describe("AuthService", () => {
	let authService: AuthService;
	let prisma: jest.Mocked<PrismaClient>;

	const mockUser = {
		id: "1",
		name: "Test User",
		email: "test@example.com",
		password: "hashedPassword",
		role: "USER" as const,
		credits: 100,
		isActive: true,
		lastLoginAt: null,
		createdAt: new Date(),
		updatedAt: new Date(),
		picture: null,
	} as User;

	beforeEach(() => {
		jest.clearAllMocks();
		authService = new AuthService();
		prisma = new PrismaClient() as jest.Mocked<PrismaClient>;
	});

	describe("register", () => {
		it("should register a new user successfully", async () => {
			const registerData = {
				name: "Test User",
				email: "test@example.com",
				password: "password123",
			};

			// 模擬用戶不存在
			prisma.user.findUnique = jest.fn().mockResolvedValue(null);

			// 模擬密碼雜湊
			bcrypt.hash = jest.fn().mockResolvedValue("hashedPassword");

			// 模擬用戶創建
			prisma.user.create = jest.fn().mockResolvedValue(mockUser);

			// 模擬 JWT 生成
			jwt.sign = jest.fn().mockReturnValue("testToken");

			const result = await authService.register(registerData);

			expect(prisma.user.findUnique).toHaveBeenCalledWith({
				where: { email: registerData.email },
			});
			expect(bcrypt.hash).toHaveBeenCalledWith(
				registerData.password,
				expect.any(Number),
			);
			expect(prisma.user.create).toHaveBeenCalledWith({
				data: {
					name: registerData.name,
					email: registerData.email,
					password: "hashedPassword",
					role: "USER",
				},
			});
			expect(jwt.sign).toHaveBeenCalled();
			expect(result).toEqual({
				token: "testToken",
				user: {
					id: mockUser.id,
					name: mockUser.name,
					email: mockUser.email,
					role: mockUser.role,
				},
			});
		});

		it("should throw an error when user already exists", async () => {
			const registerData = {
				name: "Test User",
				email: "test@example.com",
				password: "password123",
			};

			// 模擬用戶已存在
			prisma.user.findUnique = jest.fn().mockResolvedValue(mockUser);

			await expect(authService.register(registerData)).rejects.toThrow(
				"用戶已存在",
			);
		});
	});

	describe("login", () => {
		it("should login successfully with valid credentials", async () => {
			const loginData = {
				email: "test@example.com",
				password: "password123",
			};

			// 模擬找到用戶
			prisma.user.findUnique = jest.fn().mockResolvedValue(mockUser);

			// 模擬密碼驗證成功
			bcrypt.compare = jest.fn().mockResolvedValue(true);

			// 模擬 JWT 生成
			jwt.sign = jest.fn().mockReturnValue("testToken");

			const result = await authService.login(loginData);

			expect(prisma.user.findUnique).toHaveBeenCalledWith({
				where: { email: loginData.email },
			});
			expect(bcrypt.compare).toHaveBeenCalledWith(
				loginData.password,
				mockUser.password,
			);
			expect(jwt.sign).toHaveBeenCalled();
			expect(result).toEqual({
				token: "testToken",
				user: {
					id: mockUser.id,
					name: mockUser.name,
					email: mockUser.email,
					role: mockUser.role,
				},
			});
		});

		it("should throw an error when user is not found", async () => {
			const loginData = {
				email: "nonexistent@example.com",
				password: "password123",
			};

			// 模擬找不到用戶
			prisma.user.findUnique = jest.fn().mockResolvedValue(null);

			await expect(authService.login(loginData)).rejects.toThrow(
				"使用者不存在或密碼錯誤",
			);
		});

		it("should throw an error when password is incorrect", async () => {
			const loginData = {
				email: "test@example.com",
				password: "wrongpassword",
			};

			// 模擬找到用戶
			prisma.user.findUnique = jest.fn().mockResolvedValue(mockUser);

			// 模擬密碼驗證失敗
			bcrypt.compare = jest.fn().mockResolvedValue(false);

			await expect(authService.login(loginData)).rejects.toThrow(
				"使用者不存在或密碼錯誤",
			);
		});
	});

	describe("verifyToken", () => {
		it("should verify valid token", async () => {
			const token = "valid-token";
			const decodedToken = { id: "1", email: "test@example.com" };

			// 模擬 JWT 驗證
			jwt.verify = jest.fn().mockReturnValue(decodedToken);

			// 模擬找到用戶
			prisma.user.findUnique = jest.fn().mockResolvedValue(mockUser);

			const result = await authService.verifyToken(token);

			expect(jwt.verify).toHaveBeenCalled();
			expect(prisma.user.findUnique).toHaveBeenCalledWith({
				where: { id: decodedToken.id },
			});
			expect(result).toEqual({
				user: {
					id: mockUser.id,
					name: mockUser.name,
					email: mockUser.email,
					role: mockUser.role,
				},
			});
		});

		it("should throw an error when token is invalid", async () => {
			const token = "invalid-token";

			// 模擬 JWT 驗證失敗
			jwt.verify = jest.fn().mockImplementation(() => {
				throw new Error("invalid token");
			});

			await expect(authService.verifyToken(token)).rejects.toThrow(
				"無效的 Token",
			);
		});
	});

	// 這裡可以添加更多測試案例
});
