// Swagger 定義檔案
export const swaggerDefinitions = {
	RegisterSchema: {
		type: "object",
		properties: {
			name: { type: "string", minLength: 2 },
			email: { type: "string", format: "email" },
			password: { type: "string", minLength: 6 },
		},
		required: ["name", "email", "password"],
	},
	LoginSchema: {
		type: "object",
		properties: {
			email: { type: "string", format: "email" },
			password: { type: "string" },
		},
		required: ["email", "password"],
	},
	UpdateProfileSchema: {
		type: "object",
		properties: {
			name: { type: "string", minLength: 2 },
			picture: { type: "string" },
			currentPassword: { type: "string" },
			newPassword: { type: "string", minLength: 6 },
		},
	},
	DrawSchema: {
		type: "object",
		properties: {
			drawSetId: { type: "string", format: "uuid" },
			number: { type: "integer" },
		},
		required: ["drawSetId", "number"],
	},
	DrawSetSchema: {
		type: "object",
		properties: {
			name: { type: "string", minLength: 2 },
			description: { type: "string" },
			image: { type: "string" },
			enabled: { type: "boolean" },
			maxDraws: { type: "integer", minimum: 1 },
			price: { type: "integer", minimum: 0 },
			startTime: { type: "string", format: "date-time" },
			endTime: { type: "string", format: "date-time" },
		},
		required: ["name", "maxDraws", "price"],
	},
	PrizeSchema: {
		type: "object",
		properties: {
			name: { type: "string", minLength: 2 },
			description: { type: "string" },
			image: { type: "string" },
			isActive: { type: "boolean" },
			rarity: {
				type: "string",
				enum: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "LAST"],
			},
		},
		required: ["name"],
	},
	ErrorResponse: {
		type: "object",
		properties: {
			success: { type: "boolean", example: false },
			error: { type: "string" },
			errorType: {
				type: "string",
				enum: [
					"validation_error",
					"not_found",
					"unauthorized",
					"forbidden",
					"conflict",
					"internal_error",
					"bad_request",
				],
			},
			details: { type: "object" },
		},
		required: ["success", "error", "errorType"],
	},
	SuccessResponse: {
		type: "object",
		properties: {
			success: { type: "boolean", example: true },
			data: { type: "object" },
		},
		required: ["success", "data"],
	},
};
