import { PrismaClient, Role, Rarity } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

/**
 * 種子數據初始化
 */
async function main() {
	console.log("🌱 開始填充種子數據...");

	// 清理已存在數據（開發環境用）
	if (process.env.NODE_ENV !== "production") {
		console.log("🧹 清理已存在數據...");
		await prisma.drawRecord.deleteMany();
		await prisma.drawSet_Lock.deleteMany();
		await prisma.drawSetPrize.deleteMany();
		await prisma.drawSet.deleteMany();
		await prisma.prize.deleteMany();
		await prisma.user.deleteMany();
	}

	// 創建測試用戶
	console.log("👤 創建測試用戶...");
	const adminPassword = await bcrypt.hash("admin123", 10);
	const userPassword = await bcrypt.hash("password123", 10);

	const admin = await prisma.user.create({
		data: {
			name: "Admin User",
			email: "admin@example.com",
			password: adminPassword,
			role: Role.ADMIN,
			credits: 1000,
		},
	});

	const user = await prisma.user.create({
		data: {
			name: "Test User",
			email: "user@example.com",
			password: userPassword,
			role: Role.USER,
			credits: 500,
		},
	});

	console.log(`創建用戶: ${admin.name}, ${user.name}`);

	// 創建獎品
	console.log("🏆 創建獎品...");
	const prizes = await Promise.all([
		prisma.prize.create({
			data: {
				name: "A賞 - 特別獎品",
				description: "限量特別商品",
				image: "https://example.com/images/prize-a.jpg",
				isActive: true,
			},
		}),
		prisma.prize.create({
			data: {
				name: "B賞 - 人氣獎品",
				description: "市場熱門商品",
				image: "https://example.com/images/prize-b.jpg",
				isActive: true,
			},
		}),
		// Add more prizes as needed
	]);

	console.log(`創建獎品: ${prizes.length}個`);

	// 創建抽獎套組
	console.log("🎁 創建抽獎套組...");
	const now = new Date();
	const oneMonthLater = new Date(now);
	oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);

	const drawSet = await prisma.drawSet.create({
		data: {
			name: "測試抽獎活動",
			description: "這是一個測試用的抽獎活動",
			image: "https://example.com/images/drawset.jpg",
			startTime: now,
			endTime: oneMonthLater,
			enabled: true,
			maxDraws: 100,
			price: 50,
		},
	});

	console.log(`創建抽獎套組: ${drawSet.name}`);

	// 連結獎品到抽獎套組
	console.log("🔗 連結獎品到抽獎套組...");
	await prisma.drawSetPrize.createMany({
		data: [
			{
				drawSetId: drawSet.id,
				prizeId: prizes[0].id,
				rarity: Rarity.A,
				number: 1,
				quantity: 1,
				remaining: 1,
			},
			{
				drawSetId: drawSet.id,
				prizeId: prizes[1].id,
				rarity: Rarity.B,
				number: 2,
				quantity: 5,
				remaining: 5,
			},
		],
	});

	console.log("✅ 種子數據填充完成！");
}

main()
	.catch((e) => {
		console.error("種子數據填充失敗:", e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
