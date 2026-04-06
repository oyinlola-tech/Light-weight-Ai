const elements = {
  healthStatus: document.getElementById("healthStatus"),
  apiMeta: document.getElementById("apiMeta"),
  latencyValue: document.getElementById("latencyValue"),
  refreshMeta: document.getElementById("refreshMeta"),
  baseUrl: document.getElementById("baseUrl"),
  apiKey: document.getElementById("apiKey"),
  saveSettings: document.getElementById("saveSettings"),
  clearSettings: document.getElementById("clearSettings"),
  chatMessage: document.getElementById("chatMessage"),
  chatOutput: document.getElementById("chatOutput"),
  chatSessionId: document.getElementById("chatSessionId"),
  systemPrompt: document.getElementById("systemPrompt"),
  temperature: document.getElementById("temperature"),
  sendChat: document.getElementById("sendChat"),
  clearChat: document.getElementById("clearChat"),
  copyChat: document.getElementById("copyChat"),
  chatStatus: document.getElementById("chatStatus"),
  chatTimeline: document.getElementById("chatTimeline"),
  summarizeText: document.getElementById("summarizeText"),
  summarizeOutput: document.getElementById("summarizeOutput"),
  sendSummarize: document.getElementById("sendSummarize"),
  copySummary: document.getElementById("copySummary"),
  generatePrompt: document.getElementById("generatePrompt"),
  generateOutput: document.getElementById("generateOutput"),
  sendGenerate: document.getElementById("sendGenerate"),
  copyGenerate: document.getElementById("copyGenerate"),
  loadModels: document.getElementById("loadModels"),
  modelsOutput: document.getElementById("modelsOutput")
};

let chatHistory = [];

function getConfig() {
  return {
    baseUrl: elements.baseUrl?.value?.trim() || "http://localhost:3000",
    apiKey: elements.apiKey?.value?.trim() || ""
  };
}

function setStatus(el, text, ok = true) {
  if (!el) return;
  el.textContent = text;
  el.classList.remove("status-ok", "status-bad");
  el.classList.add(ok ? "status-ok" : "status-bad");
}

function storeSettings() {
  const { baseUrl, apiKey } = getConfig();
  localStorage.setItem("atlas_baseUrl", baseUrl);
  localStorage.setItem("atlas_apiKey", apiKey);
}

function restoreSettings() {
  const baseUrl = localStorage.getItem("atlas_baseUrl");
  const apiKey = localStorage.getItem("atlas_apiKey");
  if (baseUrl && elements.baseUrl) elements.baseUrl.value = baseUrl;
  if (apiKey && elements.apiKey) elements.apiKey.value = apiKey;
}

async function apiRequest(path, { method = "GET", body } = {}) {
  const { baseUrl, apiKey } = getConfig();
  const headers = { "Content-Type": "application/json" };
  if (apiKey) headers["x-api-key"] = apiKey;

  const startedAt = performance.now();
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
  const latency = Math.round(performance.now() - startedAt);
  if (elements.latencyValue) {
    elements.latencyValue.textContent = `${latency} ms`;
  }

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
  setStatus(elements.healthStatus, "Checking...", true);
  try {
    const health = await apiRequest("/api/health");
    const when = new Date(health.time).toLocaleString();
    setStatus(elements.healthStatus, `Healthy ${when}`, true);
  } catch (error) {
    setStatus(elements.healthStatus, `Offline: ${error.message}`, false);
  }
}

async function loadMeta() {
  try {
    const meta = await apiRequest("/api");
    if (elements.apiMeta) {
      elements.apiMeta.textContent = `${meta.name} v${meta.version}`;
    }
  } catch (error) {
    if (elements.apiMeta) {
      elements.apiMeta.textContent = "Metadata unavailable";
    }
  }
}

function appendTimeline(role, content) {
  const item = document.createElement("div");
  item.className = "timeline-item";
  item.innerHTML = `<strong>${role}</strong>${content}`;
  elements.chatTimeline.appendChild(item);
}

if (elements.refreshMeta) {
  elements.refreshMeta.addEventListener("click", () => {
    loadHealth();
    loadMeta();
  });
}

if (elements.saveSettings) {
  elements.saveSettings.addEventListener("click", () => {
    storeSettings();
    setStatus(elements.healthStatus, "Settings saved", true);
  });
}

if (elements.clearSettings) {
  elements.clearSettings.addEventListener("click", () => {
    localStorage.removeItem("atlas_baseUrl");
    localStorage.removeItem("atlas_apiKey");
    if (elements.apiKey) elements.apiKey.value = "";
    setStatus(elements.healthStatus, "Settings cleared", true);
  });
}

if (elements.sendChat) {
  elements.sendChat.addEventListener("click", async () => {
  const message = elements.chatMessage.value.trim();
  if (!message) return;

  const temp = Number(elements.temperature.value);
  const options = Number.isNaN(temp) ? undefined : { temperature: temp };

  const payload = {
    message,
    history: chatHistory,
    sessionId: elements.chatSessionId.value.trim() || undefined,
    systemPrompt: elements.systemPrompt.value.trim() || undefined,
    options
  };

  elements.chatOutput.textContent = "Thinking...";
  if (elements.chatStatus) elements.chatStatus.textContent = "Working...";

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
    appendTimeline("User", message);
    appendTimeline("Assistant", result.response || "(no response)");
    if (elements.chatStatus) elements.chatStatus.textContent = "Ready";
  } catch (error) {
    elements.chatOutput.textContent = `Error: ${error.message}`;
    if (elements.chatStatus) elements.chatStatus.textContent = "Error";
  }
  });
}

if (elements.clearChat) {
  elements.clearChat.addEventListener("click", () => {
  chatHistory = [];
  elements.chatOutput.textContent = "";
  elements.chatMessage.value = "";
  if (elements.chatTimeline) elements.chatTimeline.innerHTML = "";
  if (elements.chatStatus) elements.chatStatus.textContent = "Ready";
  });
}

if (elements.copyChat) {
  elements.copyChat.addEventListener("click", async () => {
  const text = elements.chatOutput.textContent.trim();
  if (!text) return;
  await navigator.clipboard.writeText(text);
  });
}

if (elements.sendSummarize) {
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
}

if (elements.copySummary) {
  elements.copySummary.addEventListener("click", async () => {
  const text = elements.summarizeOutput.textContent.trim();
  if (!text) return;
  await navigator.clipboard.writeText(text);
  });
}

if (elements.sendGenerate) {
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
}

if (elements.copyGenerate) {
  elements.copyGenerate.addEventListener("click", async () => {
  const text = elements.generateOutput.textContent.trim();
  if (!text) return;
  await navigator.clipboard.writeText(text);
  });
}

if (elements.loadModels) {
function formatModels(data) {
  if (!data || !Array.isArray(data.data)) {
    return null;
  }

  const container = document.createElement("div");
  container.className = "model-grid";

  data.data
    .filter((model) => model && model.id)
    .forEach((model) => {
      const card = document.createElement("div");
      card.className = "model-card";

      const title = document.createElement("h3");
      title.textContent = model.id;

      const owner = document.createElement("p");
      owner.textContent = `Owner: ${model.owned_by || "n/a"}`;

      const context = document.createElement("p");
      context.textContent = `Context Window: ${
        model.context_window ? model.context_window : "n/a"
      }`;

      const maxTokens = document.createElement("p");
      maxTokens.textContent = `Max Completion Tokens: ${
        model.max_completion_tokens ? model.max_completion_tokens : "n/a"
      }`;

      const active = document.createElement("p");
      active.textContent = `Active: ${model.active ? "Yes" : "No"}`;

      card.appendChild(title);
      card.appendChild(owner);
      card.appendChild(context);
      card.appendChild(maxTokens);
      card.appendChild(active);
      container.appendChild(card);
    });

  return container;
}

elements.loadModels.addEventListener("click", async () => {
  elements.modelsOutput.textContent = "Loading models...";
  try {
    const result = await apiRequest("/api/ai/models");
    const formatted = formatModels(result);
    elements.modelsOutput.innerHTML = "";
    if (formatted) {
      elements.modelsOutput.appendChild(formatted);
    } else {
      elements.modelsOutput.textContent = "No models available.";
    }
  } catch (error) {
    elements.modelsOutput.textContent = `Error: ${error.message}`;
  }
});
}

restoreSettings();
loadHealth();
loadMeta();
