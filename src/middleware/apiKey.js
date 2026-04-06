const config = require("../config");

function extractApiKey(req) {
  const headerKey = req.header("x-api-key");
  if (headerKey) return headerKey;

  const authHeader = req.header("authorization") || "";
  if (authHeader.toLowerCase().startsWith("bearer ")) {
    return authHeader.slice(7).trim();
  }
  return "";
}

module.exports = function apiKey(req, res, next) {
  if (!config.apiKey) {
    return next();
  }

  const key = extractApiKey(req);
  if (!key || key !== config.apiKey) {
    return res.status(401).json({
      error: "UNAUTHORIZED",
      message: "Missing or invalid API key."
    });
  }

  return next();
};
