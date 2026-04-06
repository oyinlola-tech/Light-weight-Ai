const config = require("../config");

const GroqImport = require("groq-sdk");
const Groq = typeof GroqImport === "function" ? GroqImport : GroqImport.default;

function getClient() {
  if (!config.groqApiKey) {
    const error = new Error("GROQ_API_KEY is not configured.");
    error.status = 500;
    throw error;
  }

  return new Groq({
    apiKey: config.groqApiKey,
    baseURL: config.groqBaseUrl,
    timeout: config.requestTimeoutMs
  });
}

async function chatCompletion(messages, options = {}) {
  const client = getClient();
  return client.chat.completions.create({
    model: config.groqModel,
    messages,
    ...options
  });
}

async function listModels() {
  const client = getClient();
  return client.models.list();
}

module.exports = {
  chatCompletion,
  listModels
};
