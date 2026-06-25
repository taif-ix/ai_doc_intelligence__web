# Contract Intelligence

Next.js migration of the React/Vite Contract Intelligence app.

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment

Create `.env.local` for local secrets:

```bash
GEMINI_API_KEY="MY_GEMINI_API_KEY"
APP_URL="http://localhost:3000"
BACKEND_API_URL="http://localhost:8080"
# VITE_API_URL="http://localhost:8080" also works for compatibility.
```

`GEMINI_API_KEY` is used only by the server-side Next API route. If it is missing or left as the placeholder value, the app falls back to its offline simulated legal analysis.

Set `BACKEND_API_URL` to the FastAPI backend from `taif-ix/contract_demo`. When configured, dashboard contracts are read from backend `/api/contracts`, analytics are read from backend `/api/analytics`, uploads are sent to backend `/upload-contracts`, and report downloads are proxied from `/export-excel`.

The old `VITE_API_URL` value is no longer required because the migrated UI calls same-origin Next API routes under `/api`.
