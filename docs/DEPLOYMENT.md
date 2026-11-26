# Deployment
## Vercel (recommended)
1. Push the repo to GitHub. 2. vercel.com -> Add New -> Project -> import it. 3. Deploy (framework: Next.js is detected). **No environment variables are required.**
Optional: add `GEMINI_API_KEY` in Project Settings -> Environment Variables.
## Limits to know (Hobby plan)
Functions run up to the `maxDuration` in `vercel.json` (30 s requested; Hobby caps lower than Pro), request bodies up to 4.5 MB (large CSV uploads), personal non-commercial use. A plan takes about 0.2 s and the 18-scenario sweep about 1-2 s.
## Self-hosting
`npm install && npm run build && npm start` (Node >= 20). Ollama works only when the server can reach it.
## Health check
`GET /api/health` shows version, dataset and which AI providers are configured.
