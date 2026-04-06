const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

const config = {
  env: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 3000),
  apiKey: process.env.API_KEY || "",
  corsOrigin: process.env.CORS_ORIGIN || "*",
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX || 100),
  enableDb: String(process.env.ENABLE_DB || "false").toLowerCase() === "true",
  dbPath: process.env.DB_PATH || path.join(process.cwd(), "data", "app.db"),
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
  ollamaModel: process.env.OLLAMA_MODEL || "llama3.2:1b",
  requestTimeoutMs: Number(process.env.REQUEST_TIMEOUT_MS || 60000)
};

module.exports = config;
