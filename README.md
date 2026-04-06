# AI Integration (Testing Project)
Author: Oluwayemi Oyinlola  
Portfolio: oyinlola.site

A full-stack testing project (frontend + backend) that exposes REST endpoints for chatting, summarizing, and generating content using an open-source model (via Ollama). Built for clean architecture, security, and easy local setup.

## Features
- Full-stack app with a premium UI
- REST API with Express
- API key authentication
- Rate limiting, CORS, Helmet
- Input validation with Zod
- Optional SQLite chat history (auto-created on startup)
- Swagger docs at `/api/docs`

## Requirements
- Node.js 18+
- Groq API key (or Ollama running locally if you switch providers)

## Quick Start
1. Install dependencies
```
npm install
```
2. Configure environment
```
cp .env.example .env
```
3. Set your Groq API key in `.env`
4. Run the server
```
npm run dev
```

Server runs at `http://localhost:3000` by default.
Open the UI at `http://localhost:3000/`.

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
curl -X POST http://localhost:3000/api/ai/chat -H "Content-Type: application/json" -H "x-api-key: change-me" -d '{"message":"Hello!"}'
~~~

### Summarize
~~~
curl -X POST http://localhost:3000/api/ai/summarize -H "Content-Type: application/json" -H "x-api-key: change-me" -d '{"text":"Paste a long paragraph here..."}'
~~~

### Generate
~~~
curl -X POST http://localhost:3000/api/ai/generate -H "Content-Type: application/json" -H "x-api-key: change-me" -d '{"prompt":"Write a short product description for a smart water bottle."}'
~~~

## Swagger Docs
Visit http://localhost:3000/api/docs for interactive API docs and testing.

## Database (Optional)
Set ENABLE_DB=true in .env to auto-create a SQLite database and store chat history at DB_PATH.

## AI Provider
This project supports Groq (default) and Ollama. In `.env`:
- `AI_PROVIDER=groq` to use Groq
- `AI_PROVIDER=ollama` to use Ollama
If using Ollama, make sure Ollama is running and the model is pulled.

## Deployment Notes
- Use environment variables for all secrets.
- Set CORS_ORIGIN to your frontend domain in production.
- Consider running Ollama on the same host or a trusted private network.
