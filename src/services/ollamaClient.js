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
      const error = new Error(`Ollama error ${response.status}: ${text}`);
      error.status = response.status;
      throw error;
    }

    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}
async function generate(prompt, options = {}) {
  return requestJson(`${config.ollamaBaseUrl}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: config.ollamaModel,
      prompt,
      stream: false,
      options
    })
  });
}
async function chat(messages, options = {}) {
  return requestJson(`${config.ollamaBaseUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: config.ollamaModel,
      messages,
      stream: false,
      options
    })
  });
}
async function listModels() {
  return requestJson(`${config.ollamaBaseUrl}/api/tags`, {
    method: "GET"
  });
}

module.exports = {
  generate,
  chat,
  listModels
};
