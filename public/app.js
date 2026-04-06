const elements = {
  healthStatus: document.getElementById("healthStatus"),
  apiMeta: document.getElementById("apiMeta"),
  refreshMeta: document.getElementById("refreshMeta"),
  baseUrl: document.getElementById("baseUrl"),
  apiKey: document.getElementById("apiKey"),
  chatMessage: document.getElementById("chatMessage"),
  chatOutput: document.getElementById("chatOutput"),
  chatSessionId: document.getElementById("chatSessionId"),
  systemPrompt: document.getElementById("systemPrompt"),
  sendChat: document.getElementById("sendChat"),
  clearChat: document.getElementById("clearChat"),
  summarizeText: document.getElementById("summarizeText"),
  summarizeOutput: document.getElementById("summarizeOutput"),
  sendSummarize: document.getElementById("sendSummarize"),
  generatePrompt: document.getElementById("generatePrompt"),
  generateOutput: document.getElementById("generateOutput"),
  sendGenerate: document.getElementById("sendGenerate"),
  loadModels: document.getElementById("loadModels"),
  modelsOutput: document.getElementById("modelsOutput")
};

let chatHistory = [];

function getConfig() {
  return {
    baseUrl: elements.baseUrl.value.trim() || "http://localhost:3000",
    apiKey: elements.apiKey.value.trim()
  };
}

async function apiRequest(path, { method = "GET", body } = {}) {
  const { baseUrl, apiKey } = getConfig();
  const headers = { "Content-Type": "application/json" };
  if (apiKey) headers["x-api-key"] = apiKey;

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  const text = await response.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch (error) {
    data = { raw: text };
  }

  if (!response.ok) {
    throw new Error(data.message || `Request failed (${response.status})`);
  }

  return data;
}

async function loadHealth() {
  elements.healthStatus.textContent = "Checking API health...";
  elements.healthStatus.classList.remove("ok", "bad");

  try {
    const health = await apiRequest("/api/health");
    elements.healthStatus.textContent = `Healthy as of ${new Date(
      health.time
    ).toLocaleString()}`;
    elements.healthStatus.classList.add("ok");
  } catch (error) {
    elements.healthStatus.textContent = `Health check failed: ${error.message}`;
    elements.healthStatus.classList.add("bad");
  }
}

async function loadMeta() {
  try {
    const meta = await apiRequest("/api");
    elements.apiMeta.textContent = `${meta.name} v${meta.version}`;
  } catch (error) {
    elements.apiMeta.textContent = "Metadata unavailable.";
  }
}

elements.refreshMeta.addEventListener("click", () => {
  loadHealth();
  loadMeta();
});

elements.sendChat.addEventListener("click", async () => {
  const message = elements.chatMessage.value.trim();
  if (!message) return;

  const payload = {
    message,
    history: chatHistory,
    sessionId: elements.chatSessionId.value.trim() || undefined,
    systemPrompt: elements.systemPrompt.value.trim() || undefined
  };

  elements.chatOutput.textContent = "Thinking...";

  try {
    const result = await apiRequest("/api/ai/chat", {
      method: "POST",
      body: payload
    });

    chatHistory = [
      ...chatHistory,
      { role: "user", content: message },
      { role: "assistant", content: result.response }
    ];

    elements.chatOutput.textContent = result.response || "(no response)";
    elements.chatMessage.value = "";
    if (!elements.chatSessionId.value) {
      elements.chatSessionId.value = result.sessionId;
    }
  } catch (error) {
    elements.chatOutput.textContent = `Error: ${error.message}`;
  }
});

elements.clearChat.addEventListener("click", () => {
  chatHistory = [];
  elements.chatOutput.textContent = "";
  elements.chatMessage.value = "";
});

elements.sendSummarize.addEventListener("click", async () => {
  const text = elements.summarizeText.value.trim();
  if (!text) return;

  elements.summarizeOutput.textContent = "Summarizing...";
  try {
    const result = await apiRequest("/api/ai/summarize", {
      method: "POST",
      body: { text }
    });
    elements.summarizeOutput.textContent = result.summary || "(no summary)";
  } catch (error) {
    elements.summarizeOutput.textContent = `Error: ${error.message}`;
  }
});

elements.sendGenerate.addEventListener("click", async () => {
  const prompt = elements.generatePrompt.value.trim();
  if (!prompt) return;

  elements.generateOutput.textContent = "Generating...";
  try {
    const result = await apiRequest("/api/ai/generate", {
      method: "POST",
      body: { prompt }
    });
    elements.generateOutput.textContent = result.output || "(no output)";
  } catch (error) {
    elements.generateOutput.textContent = `Error: ${error.message}`;
  }
});

elements.loadModels.addEventListener("click", async () => {
  elements.modelsOutput.textContent = "Loading models...";
  try {
    const result = await apiRequest("/api/ai/models");
    elements.modelsOutput.textContent = JSON.stringify(result, null, 2);
  } catch (error) {
    elements.modelsOutput.textContent = `Error: ${error.message}`;
  }
});

loadHealth();
loadMeta();
