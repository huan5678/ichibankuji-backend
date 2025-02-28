/**
 * Swagger 相關類型定義
 */

export interface SwaggerInfo {
	title: string;
	version: string;
	description: string;
	contact?: {
		name: string;
		url?: string;
		email?: string;
	};
	license?: {
		name: string;
		url?: string;
	};
}

export interface SwaggerServer {
	url: string;
	description?: string;
	variables?: Record<string, unknown>;
}

export interface SwaggerTag {
	name: string;
	description?: string;
	externalDocs?: {
		description: string;
		url: string;
	};
}

export interface SwaggerSecurityScheme {
	type: "apiKey" | "http" | "oauth2" | "openIdConnect";
	description?: string;
	name?: string;
	in?: "query" | "header" | "cookie";
	scheme?: string;
	bearerFormat?: string;
	flows?: Record<string, unknown>;
	openIdConnectUrl?: string;
}

export interface SwaggerComponents {
	schemas?: Record<string, unknown>;
	responses?: Record<string, unknown>;
	parameters?: Record<string, unknown>;
	examples?: Record<string, unknown>;
	requestBodies?: Record<string, unknown>;
	headers?: Record<string, unknown>;
	securitySchemes?: Record<string, SwaggerSecurityScheme>;
	links?: Record<string, unknown>;
	callbacks?: Record<string, unknown>;
}

export interface SwaggerPathItem {
	summary?: string;
	description?: string;
	get?: SwaggerOperation;
	put?: SwaggerOperation;
	post?: SwaggerOperation;
	delete?: SwaggerOperation;
	options?: SwaggerOperation;
	head?: SwaggerOperation;
	patch?: SwaggerOperation;
	trace?: SwaggerOperation;
	servers?: SwaggerServer[];
	parameters?: unknown[];
}

export interface SwaggerOperation {
	tags?: string[];
	summary?: string;
	description?: string;
	externalDocs?: {
		description?: string;
		url: string;
	};
	operationId?: string;
	parameters?: unknown[];
	requestBody?: unknown;
	responses: Record<string, unknown>;
	callbacks?: Record<string, unknown>;
	deprecated?: boolean;
	security?: Record<string, string[]>[];
	servers?: SwaggerServer[];
}

export interface SwaggerDocument {
	openapi: string;
	info: SwaggerInfo;
	servers?: SwaggerServer[];
	paths: Record<string, SwaggerPathItem>;
	components?: SwaggerComponents;
	security?: Record<string, string[]>[];
	tags?: SwaggerTag[];
	externalDocs?: {
		description?: string;
		url: string;
	};
}
