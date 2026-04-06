const config = require("../config");

const GroqImport = require("groq-sdk");
const Groq = typeof GroqImport === "function" ? GroqImport : GroqImport.default;

function getClient() {
  if (!config.groqApiKey) {
    const error = new Error("GROQ_API_KEY is not configured.");
    error.status = 500;
    throw error;
  }

  const baseURL = (config.groqBaseUrl || "https://api.groq.com").replace(
    /\/openai\/v1\/?$/i,
    ""
  );

  return new Groq({
    apiKey: config.groqApiKey,
    baseURL,
    timeout: config.requestTimeoutMs
  });
}

async function chatCompletion(messages, options = {}) {
  const client = getClient();
  try {
    return await client.chat.completions.create({
      model: config.groqModel,
      messages,
      ...options
    });
  } catch (error) {
    const err = new Error(error?.message || "Groq request failed.");
    err.status = error?.status || 502;
    err.code = "GROQ_ERROR";
    throw err;
  }
}

async function listModels() {
  const client = getClient();
  try {
    return await client.models.list();
  } catch (error) {
    const err = new Error(error?.message || "Groq request failed.");
    err.status = error?.status || 502;
    err.code = "GROQ_ERROR";
    throw err;
  }
}

module.exports = {
  chatCompletion,
  listModels
};
