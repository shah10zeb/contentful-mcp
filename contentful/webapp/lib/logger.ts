const LOG_LEVEL = process.env.LOG_LEVEL || "info";

const levels = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel = levels[LOG_LEVEL as keyof typeof levels] ?? 1;

export const logger = {
  debug: (message: string, meta?: any) => {
    if (currentLevel <= 0) {
      console.debug(`[DEBUG] ${message}`, meta ? JSON.stringify(meta, null, 2) : "");
    }
  },
  info: (message: string, meta?: any) => {
    if (currentLevel <= 1) {
      console.info(`[INFO] ${message}`, meta ? JSON.stringify(meta, null, 2) : "");
    }
  },
  warn: (message: string, meta?: any) => {
    if (currentLevel <= 2) {
      console.warn(`[WARN] ${message}`, meta ? JSON.stringify(meta, null, 2) : "");
    }
  },
  error: (message: string, meta?: any) => {
    if (currentLevel <= 3) {
      console.error(`[ERROR] ${message}`, meta ? JSON.stringify(meta, null, 2) : "");
    }
  },
};
