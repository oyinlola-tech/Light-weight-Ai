const config = require("../config");

async function requestJson(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.requestTimeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });

    if (!response.ok) {
      const text = await response.text();
      const error = new Error(`Groq error ${response.status}: ${text}`);
      error.status = response.status;
      throw error;
    }

    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

function buildHeaders() {
  if (!config.groqApiKey) {
    const error = new Error("GROQ_API_KEY is not configured.");
    error.status = 500;
    throw error;
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${config.groqApiKey}`
  };
}

async function chatCompletion(messages, options = {}) {
  return requestJson(`${config.groqBaseUrl}/chat/completions`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify({
      model: config.groqModel,
      messages,
      ...options
    })
  });
}

async function listModels() {
  return requestJson(`${config.groqBaseUrl}/models`, {
    method: "GET",
    headers: buildHeaders()
  });
}

module.exports = {
  chatCompletion,
  listModels
};
