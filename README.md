# ProposalAI

AI-powered commercial proposal generator. Fill in client and service data, generate professional proposals with Groq (LLaMA 3.3 70B), edit sections, and export to PDF. Includes automated follow-up routine for stale proposals.

## Stack

- **Frontend:** Next.js 16 (App Router) + Tailwind CSS
- **Backend:** Node.js + Express
- **AI:** Groq API (llama-3.3-70b)
- **Database:** PostgreSQL
- **PDF:** jsPDF (client-side)
- **Infra:** Docker + docker-compose

## Getting Started

### Prerequisites

- Node.js 22+
- PostgreSQL 17+ (or Docker)
- Groq API key

### With Docker (recommended)

```bash
cp .env.example .env
# Edit .env with your GROQ_API_KEY and a strong JWT_SECRET
docker compose up --build
```

Frontend: http://localhost:3000
Backend: http://localhost:3001

### Without Docker

```bash
cp .env.example .env
# Edit .env with your credentials

# Backend
cd backend
npm install
npm run migrate
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

## Project Structure

```
proposal-ai/
├── backend/              Express API
│   └── src/
│       ├── routes/       Auth, proposals, routines
│       ├── services/     Groq client, follow-up routine
│       ├── middleware/    JWT auth, error handler
│       └── db/           Migrations
├── frontend/             Next.js app
│   └── src/
│       ├── app/          Pages (login, proposals, routines)
│       ├── components/   Reusable UI components
│       ├── lib/          API client, auth context
│       └── types/        TypeScript definitions
├── handoffs/             Pipeline artifacts
├── docker-compose.yml
└── .env.example
```

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/health | No | Health check |
| POST | /api/auth/register | No | Create account |
| POST | /api/auth/login | No | Sign in |
| GET | /api/proposals | Yes | List proposals |
| GET | /api/proposals/:id | Yes | Get proposal |
| POST | /api/proposals | Yes | Create proposal |
| PUT | /api/proposals/:id | Yes | Update proposal |
| PATCH | /api/proposals/:id/status | Yes | Update status |
| DELETE | /api/proposals/:id | Yes | Delete proposal |
| POST | /api/proposals/:id/generate | Yes | Generate with AI |
| GET | /api/routines/logs | Yes | Routine history |
| POST | /api/routines/follow-up/trigger | Yes | Manual trigger |

## Tests

```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test
```
