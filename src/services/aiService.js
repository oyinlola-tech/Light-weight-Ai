const config = require("../config");
const { chat, generate, listModels } = require("./ollamaClient");
const { chatCompletion: groqChatCompletion, listModels: listGroqModels } =
  require("./groqClient");

const DEFAULT_SYSTEM_PROMPT =
  "You are a concise, helpful assistant. Follow instructions carefully and be safe.";

function buildMessages({ message, history = [], systemPrompt = DEFAULT_SYSTEM_PROMPT }) {
  const messages = [];
  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt });
  }

  for (const item of history) {
    if (item.role && item.content) {
      messages.push({ role: item.role, content: item.content });
    }
  }

  messages.push({ role: "user", content: message });
  return messages;
}

async function chatCompletion({ message, history, systemPrompt, options }) {
  const messages = buildMessages({ message, history, systemPrompt });
  if (config.aiProvider === "groq") {
    const response = await chatCompletionGroq(messages, options);
    return response;
  }

  const response = await chat(messages, options);
  return {
    model: response.model,
    response: response.message?.content || "",
    raw: response
  };
}

async function summarizeText({ text, options }) {
  const systemPrompt =
    "You are a summarization assistant. Provide a clear, short summary in 3-5 sentences.";
  if (config.aiProvider === "groq") {
    const response = await chatCompletionGroq(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: text }
      ],
      options
    );

    return {
      model: response.model,
      summary: response.response,
      raw: response.raw
    };
  }

  const response = await chat(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: text }
    ],
    options
  );

  return {
    model: response.model,
    summary: response.message?.content || "",
    raw: response
  };
}

async function generateText({ prompt, options }) {
  if (config.aiProvider === "groq") {
    const response = await chatCompletionGroq(
      [{ role: "user", content: prompt }],
      options
    );
    return {
      model: response.model,
      output: response.response,
      raw: response.raw
    };
  }

  const response = await generate(prompt, options);
  return {
    model: response.model,
    output: response.response || "",
    raw: response
  };
}

async function getModels() {
  if (config.aiProvider === "groq") {
    return listGroqModels();
  }
  return listModels();
}

module.exports = {
  chatCompletion,
  summarizeText,
  generateText,
  getModels
};

async function chatCompletionGroq(messages, options = {}) {
  const response = await groqChatCompletion(messages, {
    temperature: options?.temperature,
    max_tokens: options?.max_tokens,
    top_p: options?.top_p
  });

  const content = response.choices?.[0]?.message?.content || "";
  return {
    model: response.model,
    response: content,
    raw: response
  };
}
