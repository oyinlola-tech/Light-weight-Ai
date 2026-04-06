const express = require("express");
const { healthHandler } = require("../controllers/healthController");

const router = express.Router();

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check
 *     responses:
 *       200:
 *         description: Service is healthy
 */
router.get("/", healthHandler);

module.exports = router;
