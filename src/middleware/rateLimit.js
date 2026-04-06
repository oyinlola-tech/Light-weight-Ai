const rateLimit = require("express-rate-limit");
const config = require("../config");

const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "RATE_LIMIT_EXCEEDED",
    message: "Too many requests, please try again later."
  }
});

module.exports = limiter;
