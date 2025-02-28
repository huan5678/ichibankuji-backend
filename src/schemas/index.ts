// 明確導出所有 schema
// Auth 相關 schema
export {
	adminUserUpdateSchema,
	forgotPasswordSchema,
	loginSchema,
	registerSchema,
	resetPasswordSchema,
	updateProfileSchema,
} from "./auth.schema";

// Draw 相關 schema
export {
	executeDrawSchema,
	ExecuteDrawInput,
} from "./draw.schema";

// DrawSet 相關 schema
export {
	createDrawSetSchema,
	CreateDrawSetInput,
} from "./drawSet.schema";

// DrawSetPrize 相關 schema
export {
	addPrizeSchema,
	updatePrizeRaritySchema,
	CreateDrawSetPrizeInput,
} from "./drawSetPrize.schema";

// Prize 相關 schema
export {
	createPrizeSchema,
	CreatePrizeInput,
} from "./prize.schema";

// Rarity 相關 schema
export { rarityEnum, RarityEnum } from "./rarity.schema";
