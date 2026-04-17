# ProposalAI

Gerador de propostas comerciais com IA para freelancers e pequenas agências: cadastre cliente e serviço, a LLM escreve a proposta em segundos, você edita por seção e exporta PDF. Rotina de follow-up em cron diário (9h) varre propostas paradas há mais de 3 dias e gera mensagens de retomada personalizadas — com log persistente de cada execução. Auth própria com JWT e bcrypt, sem dependência de BaaS.

## Recursos

- Geração de proposta por seção (resumo, escopo, entregas, investimento) via Groq com Llama 3.3 70B
- Editor por seção com regeneração pontual sem refazer a proposta inteira
- Export PDF client-side com jsPDF (sem round-trip no servidor)
- Autenticação própria: JWT em cookie httpOnly, senhas com bcrypt, sem BaaS
- Rotina de follow-up automática: cron diário às 09:00 (America/Sao_Paulo) detecta propostas paradas há mais de 3 dias e gera mensagens de retomada
- Disparo manual da rotina e histórico persistente de execuções em `/api/routines/logs`
- Migrations SQL versionadas, aplicadas via `npm run migrate`

## Stack

- **Frontend:** Next.js 16
- **Backend:** Node.js, Express 5
- **AI:** Groq API
- **Auth:** JWT, httpOnly cookies
- **Database:** PostgreSQL 17
- **Jobs:** node-cron
- **Testing:** Jest, Supertest, Vitest
- **Infra:** Docker

## Como começar

### Pré-requisitos

- Node.js 22+
- PostgreSQL 17+ (ou Docker)
- Chave de API do Groq

### Com Docker (recomendado)

```bash
cp .env.example .env
# Edite .env com sua GROQ_API_KEY e um JWT_SECRET forte
docker compose up --build
```

Frontend: http://localhost:3000
Backend: http://localhost:3001

### Sem Docker

```bash
cp .env.example .env
# Edite .env com suas credenciais

# Backend
cd backend
npm install
npm run migrate
npm run dev

# Frontend (novo terminal)
cd frontend
npm install
npm run dev
```

## Estrutura

```
proposal-ai/
├── backend/              API Express
│   └── src/
│       ├── routes/       Auth, propostas, rotinas
│       ├── services/     Cliente Groq, rotina de follow-up
│       ├── middleware/   Auth JWT, error handler
│       └── db/           Migrations
├── frontend/             App Next.js
│   └── src/
│       ├── app/          Páginas (login, propostas, rotinas)
│       ├── components/   Componentes de UI reutilizáveis
│       ├── lib/          Cliente HTTP, auth context
│       └── types/        Definições TypeScript
├── handoffs/             Artefatos do pipeline
├── docker-compose.yml
└── .env.example
```

## Endpoints da API

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | /api/health | Não | Health check |
| POST | /api/auth/register | Não | Criar conta |
| POST | /api/auth/login | Não | Login |
| GET | /api/proposals | Sim | Listar propostas |
| GET | /api/proposals/:id | Sim | Obter proposta |
| POST | /api/proposals | Sim | Criar proposta |
| PUT | /api/proposals/:id | Sim | Atualizar proposta |
| PATCH | /api/proposals/:id/status | Sim | Atualizar status |
| DELETE | /api/proposals/:id | Sim | Deletar proposta |
| POST | /api/proposals/:id/generate | Sim | Gerar com IA |
| GET | /api/routines/logs | Sim | Histórico da rotina |
| POST | /api/routines/follow-up/trigger | Sim | Disparo manual |

## Testes

```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test
```

## English

AI-powered commercial proposal generator for freelancers and small agencies: register client and service, the LLM writes the proposal in seconds, you edit section by section and export to PDF. A daily cron job (9:00 AM) scans proposals idle for more than 3 days and generates personalized follow-up messages — with persistent log of each run. Own auth with JWT and bcrypt, no BaaS dependency.

### Features

- Section-based proposal generation (summary, scope, deliverables, pricing) via Groq with Llama 3.3 70B
- Per-section editor with targeted regeneration, no need to rebuild the whole proposal
- Client-side PDF export with jsPDF (no server round-trip)
- Own authentication: JWT in httpOnly cookie, bcrypt-hashed passwords, no BaaS
- Automated follow-up routine: daily cron at 09:00 (America/Sao_Paulo) detects proposals idle for more than 3 days and generates follow-up messages
- Manual trigger and persistent run history at `/api/routines/logs`
- Versioned SQL migrations, applied via `npm run migrate`

### Stack

- **Frontend:** Next.js 16
- **Backend:** Node.js, Express 5
- **AI:** Groq API
- **Auth:** JWT, httpOnly cookies
- **Database:** PostgreSQL 17
- **Jobs:** node-cron
- **Testing:** Jest, Supertest, Vitest
- **Infra:** Docker

### Getting Started

#### Prerequisites

- Node.js 22+
- PostgreSQL 17+ (or Docker)
- Groq API key

#### With Docker (recommended)

```bash
cp .env.example .env
# Edit .env with your GROQ_API_KEY and a strong JWT_SECRET
docker compose up --build
```

Frontend: http://localhost:3000
Backend: http://localhost:3001

#### Without Docker

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

### Project Structure

```
proposal-ai/
├── backend/              Express API
│   └── src/
│       ├── routes/       Auth, proposals, routines
│       ├── services/     Groq client, follow-up routine
│       ├── middleware/   JWT auth, error handler
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

### API Endpoints

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

### Tests

```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test
```
