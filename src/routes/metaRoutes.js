const express = require("express");
const { metaHandler } = require("../controllers/metaController");

const router = express.Router();

/**
 * @swagger
 * /api:
 *   get:
 *     summary: API metadata
 *     responses:
 *       200:
 *         description: Basic API info
 */
router.get("/", metaHandler);

module.exports = router;
