# Simple AI Integration Backend

A lightweight Express backend that exposes REST endpoints for chatting, summarizing, and generating content using an open-source model (via Ollama). Built for clean architecture, security, and easy local setup.

## Features
- REST API with Express
- API key authentication
- Rate limiting, CORS, Helmet
- Input validation with Zod
- Optional SQLite chat history (auto-created on startup)
- Swagger docs at `/api/docs`

## Requirements
- Node.js 18+
- Ollama installed and running locally (or a compatible Ollama endpoint)

## Quick Start
1. Install dependencies
```
npm install
```
2. Configure environment
```
cp .env.example .env
```
3. Start Ollama (example)
```
ollama serve
ollama pull llama3.2:1b
```
4. Run the server
```
npm run dev
```

Server runs at `http://localhost:3000` by default.

## API Authentication
Send your API key with either header:
- `x-api-key: <API_KEY>`
- `Authorization: Bearer <API_KEY>`

## Endpoints
- `GET /api/health`
- `GET /api`
- `POST /api/ai/chat`
- `POST /api/ai/summarize`
- `POST /api/ai/generate`
- `GET /api/ai/models`
- GET /api/ai/history (requires ENABLE_DB=true)
- GET /api/ai/history/:sessionId (requires ENABLE_DB=true)

## Example Requests
### Chat
~~~
curl -X POST http://localhost:3000/api/ai/chat \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: change-me" \\
~~~

## Example Requests
### Chat
~~~
