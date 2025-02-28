import { z } from "zod";

export const rarityEnum = z.enum([
	"A",
	"B",
	"C",
	"D",
	"E",
	"F",
	"G",
	"H",
	"I",
	"J",
	"LAST",
]);

// 建立稀有度驗證 schema
export const raritySchema = z.object({
	rarity: rarityEnum,
});

export type RarityEnum = z.infer<typeof rarityEnum>;
export type RaritySchema = z.infer<typeof raritySchema>;
