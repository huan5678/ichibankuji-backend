export enum LogLevel {
	DEBUG = "debug",
	INFO = "info",
	WARN = "warn",
	ERROR = "error",
}

class Logger {
	private level: LogLevel = LogLevel.INFO;

	constructor() {
		// 從環境變數設定日誌級別
		const envLevel = process.env.LOG_LEVEL as LogLevel;
		if (Object.values(LogLevel).includes(envLevel)) {
			this.level = envLevel;
		}
	}

	private shouldLog(level: LogLevel): boolean {
		const levels = {
			[LogLevel.DEBUG]: 0,
			[LogLevel.INFO]: 1,
			[LogLevel.WARN]: 2,
			[LogLevel.ERROR]: 3,
		};

		return levels[level] >= levels[this.level];
	}

	debug(message: string, ...args: unknown[]): void {
		if (this.shouldLog(LogLevel.DEBUG)) {
			console.debug(
				`[DEBUG] ${new Date().toISOString()} - ${message}`,
				...args,
			);
		}
	}

	info(message: string, ...args: unknown[]): void {
		if (this.shouldLog(LogLevel.INFO)) {
			console.info(`[INFO] ${new Date().toISOString()} - ${message}`, ...args);
		}
	}

	warn(message: string, ...args: unknown[]): void {
		if (this.shouldLog(LogLevel.WARN)) {
			console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, ...args);
		}
	}

	error(message: string, error?: unknown, ...args: unknown[]): void {
		if (this.shouldLog(LogLevel.ERROR)) {
			console.error(
				`[ERROR] ${new Date().toISOString()} - ${message}`,
				error,
				...args,
			);
		}
	}

	request(
		method: string,
		path: string,
		statusCode: number,
		responseTime: number,
	): void {
		if (this.shouldLog(LogLevel.INFO)) {
			console.info(
				`[REQUEST] ${new Date().toISOString()} - ${method} ${path} ${statusCode} ${responseTime}ms`,
			);
		}
	}
}

export const logger = new Logger();
