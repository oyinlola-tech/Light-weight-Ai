const express = require("express");
const { z } = require("zod");
const validate = require("../middleware/validate");
const apiKey = require("../middleware/apiKey");
const {
  chatHandler,
  summarizeHandler,
  generateHandler,
  modelsHandler,
  historyHandler,
  sessionHistoryHandler
} = require("../controllers/aiController");

const router = express.Router();
router.use(apiKey);

const chatSchema = z.object({
  body: z.object({
    message: z.string().min(1),
    history: z
      .array(
        z.object({
          role: z.enum(["system", "user", "assistant"]),
          content: z.string().min(1)
        })
      )
      .optional(),
    sessionId: z.string().optional(),
    options: z.record(z.any()).optional()
  })
});

const summarizeSchema = z.object({
  body: z.object({
    text: z.string().min(1),
    sessionId: z.string().optional(),
    options: z.record(z.any()).optional()
  })
});

const generateSchema = z.object({
  body: z.object({
    prompt: z.string().min(1),
    sessionId: z.string().optional(),
    options: z.record(z.any()).optional()
  })
});

const historyQuerySchema = z.object({
  query: z.object({
    limit: z.string().optional()
  })
});

const sessionHistorySchema = z.object({
  params: z.object({
    sessionId: z.string().min(1)
  }),
  query: z.object({
    limit: z.string().optional()
  })
});

/**
 * @swagger
 * /api/ai/chat:
 *   post:
 *     summary: Send a chat message and receive a response
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *               history:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                     content:
 *                       type: string
 *               sessionId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Chat response
 */
router.post("/chat", validate(chatSchema), chatHandler);

/**
 * @swagger
 * /api/ai/summarize:
 *   post:
 *     summary: Summarize a block of text
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *               sessionId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Summary response
 */
router.post("/summarize", validate(summarizeSchema), summarizeHandler);

/**
 * @swagger
 * /api/ai/generate:
 *   post:
 *     summary: Generate content from a prompt
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prompt:
 *                 type: string
 *               sessionId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Generation response
 */
router.post("/generate", validate(generateSchema), generateHandler);

/**
 * @swagger
 * /api/ai/models:
 *   get:
 *     summary: List available AI models
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Model list
 */
router.get("/models", modelsHandler);

/**
 * @swagger
 * /api/ai/history:
 *   get:
 *     summary: List recent chat sessions (if DB enabled)
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Recent sessions
 */
router.get("/history", validate(historyQuerySchema), historyHandler);

/**
 * @swagger
 * /api/ai/history/{sessionId}:
 *   get:
 *     summary: Get messages for a session (if DB enabled)
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Session history
 */
router.get("/history/:sessionId", validate(sessionHistorySchema), sessionHistoryHandler);

module.exports = router;
