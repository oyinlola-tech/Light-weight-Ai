const crypto = require("crypto");
const config = require("../config");
const {
  chatCompletion,
  summarizeText,
  generateText,
  getModels
} = require("../services/aiService");
const {
  insertMessage,
  getRecentSessions,
  getSessionHistory
} = require("../db");

function savePair({ sessionId, userContent, assistantContent, type }) {
  if (!config.enableDb) return;
  insertMessage({ sessionId, role: "user", content: userContent, type });
  insertMessage({
    sessionId,
    role: "assistant",
    content: assistantContent,
    type
  });
}

async function chatHandler(req, res, next) {
  try {
    const { message, history = [], sessionId, options } = req.validated.body;
    const resolvedSessionId = sessionId || crypto.randomUUID();

    const result = await chatCompletion({ message, history, options });
    savePair({
      sessionId: resolvedSessionId,
      userContent: message,
      assistantContent: result.response,
      type: "chat"
    });

    res.json({
      sessionId: resolvedSessionId,
      model: result.model,
      response: result.response
    });
  } catch (error) {
    next(error);
  }
}
async function summarizeHandler(req, res, next) {
  try {
    const { text, sessionId, options } = req.validated.body;
    const resolvedSessionId = sessionId || crypto.randomUUID();

    const result = await summarizeText({ text, options });
    savePair({
      sessionId: resolvedSessionId,
      userContent: text,
      assistantContent: result.summary,
      type: "summarize"
    });

    res.json({
      sessionId: resolvedSessionId,
      model: result.model,
      summary: result.summary
    });
  } catch (error) {
    next(error);
  }
}

async function generateHandler(req, res, next) {
  try {
    const { prompt, sessionId, options } = req.validated.body;
    const resolvedSessionId = sessionId || crypto.randomUUID();

    const result = await generateText({ prompt, options });
    savePair({
      sessionId: resolvedSessionId,
      userContent: prompt,
      assistantContent: result.output,
      type: "generate"
    });

    res.json({
      sessionId: resolvedSessionId,
      model: result.model,
      output: result.output
    });
  } catch (error) {
    next(error);
  }
}
async function modelsHandler(req, res, next) {
  try {
    const result = await getModels();
    res.json(result);
  } catch (error) {
    next(error);
  }
}

function historyHandler(req, res) {
  if (!config.enableDb) {
    return res.status(400).json({
      error: "DB_DISABLED",
      message: "Database is disabled. Set ENABLE_DB=true to enable history."
    });
  }

  const { limit = 20 } = req.validated.query;
  const sessions = getRecentSessions(Number(limit));
  return res.json({ sessions });
}

function sessionHistoryHandler(req, res) {
  if (!config.enableDb) {
    return res.status(400).json({
      error: "DB_DISABLED",
      message: "Database is disabled. Set ENABLE_DB=true to enable history."
    });
  }

  const { sessionId } = req.validated.params;
  const { limit = 50 } = req.validated.query;
  const history = getSessionHistory(sessionId, Number(limit));
  return res.json({ sessionId, history });
}

module.exports = {
  chatHandler,
  summarizeHandler,
  generateHandler,
  modelsHandler,
  historyHandler,
  sessionHistoryHandler
};
