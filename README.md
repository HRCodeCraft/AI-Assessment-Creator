# VedaAI – AI Assessment Creator

An AI-powered full-stack web app that lets teachers generate structured, multi-section question papers in seconds — complete with an answer key — using the Groq LLM API. Built as a monorepo with a Next.js frontend and an Express + BullMQ backend.

---

## Live Demo

> **App:** https://your-frontend.up.railway.app  
> **API:** https://your-backend.up.railway.app

---

## Features

- **4-step assignment wizard** — title/subject/grade/topic, question type setup (dynamic rows with per-type count + marks), difficulty distribution sliders, review & generate
- **AI question paper generation** — structured JSON from `llama-3.3-70b-versatile` via Groq API, parsed into typed, section-wise exam papers
- **Answer key** — every question includes a `correctAnswer` field generated in the same AI call; displayed in a separate section at the bottom of the paper
- **File upload** — upload a PDF or TXT reference; text is extracted via `pdf-parse` and injected into the AI prompt so questions are based on actual content
- **Real-time progress** — Socket.io events pushed from the BullMQ worker to the browser with Redis polling as a WebSocket fallback
- **Rate-limit handling** — automatic retry with backoff when Groq returns 429/413; waits the exact number of seconds the API specifies
- **PDF export** — multi-page A4 export via `html2canvas` + `jsPDF`
- **Answer Keys page** — searchable and filterable list of all generated papers with expandable answer keys
- **Responsive UI** — full mobile layout with a bottom navigation bar, responsive form cards, and a compact mobile paper banner
- **Settings** — persist school name, teacher name, and classes; school name appears automatically on every generated paper

---

## Architecture

```
┌──────────────────────┐      REST + WebSocket      ┌─────────────────────────────┐
│   Next.js Frontend   │ ◄────────────────────────► │   Express Backend (:3001)    │
│   (:3000)            │                             │                             │
│                      │                             │  ┌────────────────────────┐ │
│  • Dashboard         │                             │  │  MongoDB (Mongoose)     │ │
│  • 4-step Create     │                             │  │  assignments + papers   │ │
│  • Paper View        │                             │  └────────────────────────┘ │
│  • Answer Keys       │                             │  ┌────────────────────────┐ │
│  • Settings          │                             │  │  Redis                  │ │
│                      │                             │  │  progress cache + queue │ │
│  Zustand (state)     │                             │  └────────────────────────┘ │
│  socket.io-client    │                             │  ┌────────────────────────┐ │
└──────────────────────┘                             │  │  BullMQ Worker          │ │
                                                     │  │  → Groq API call        │ │
                                                     │  │  → parse + save paper   │ │
                                                     │  └────────────────────────┘ │
                                                     └─────────────────────────────┘
```

### Generation Flow

1. Teacher completes the 4-step form → `POST /api/assignments` (with optional file upload)
2. Backend extracts PDF/TXT text via `pdf-parse`, saves the assignment to MongoDB, enqueues a BullMQ job
3. Frontend joins a Socket.io room (`assignment:{id}`) and starts a polling fallback
4. BullMQ worker calls Groq API (`llama-3.3-70b-versatile`), emitting progress events at each stage
5. Worker parses and validates the JSON response, normalises question types to MongoDB enums, saves the `QuestionPaper` document
6. `generation:complete` event → frontend navigates to `/paper/{paperId}`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion, Zustand |
| Backend | Node.js, Express, TypeScript |
| AI | Groq API — `llama-3.3-70b-versatile` (via axios) |
| Queue | BullMQ |
| Database | MongoDB (Mongoose) |
| Cache | Redis |
| Realtime | Socket.io |
| File parsing | pdf-parse |
| PDF export | html2canvas + jsPDF |

---

## Project Structure

```
/
├── frontend/          # Next.js 14 app
│   └── src/
│       ├── app/       # Pages (dashboard, create, paper, answer-keys, settings)
│       ├── components/# UI components (AssignmentForm, QuestionPaper, layout)
│       ├── hooks/     # useWebSocket
│       ├── lib/       # API client, utils
│       └── store/     # Zustand stores (assignments, settings)
│
├── backend/           # Express API + BullMQ worker
│   └── src/
│       ├── config.ts
│       ├── index.ts   # Server bootstrap
│       ├── lib/       # Redis, Socket.io, BullMQ queue
│       ├── models/    # Mongoose models (Assignment, QuestionPaper)
│       ├── routes/    # assignments.ts, papers.ts
│       ├── services/  # aiService.ts (Groq prompt + parse + retry)
│       └── workers/   # generationWorker.ts
│
└── docker-compose.yml # MongoDB + Redis
```

---

## Local Setup

### Prerequisites

- Node.js 18+
- Docker + Docker Compose
- [Groq API Key](https://console.groq.com) (free tier works)

### 1. Clone & install dependencies

```bash
git clone <repo-url>
cd AI-Assessment-Creator

# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 2. Configure environment variables

**backend/.env**
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/assessment_creator
REDIS_URL=redis://localhost:6379
GROQ_API_KEY=your_groq_api_key_here
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

**frontend/.env.local**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=http://localhost:3001
```

### 3. Start MongoDB + Redis

```bash
# From project root
docker-compose up -d
```

### 4. Start the backend

```bash
cd backend
npm run dev
# Runs on http://localhost:3001
```

### 5. Start the frontend

```bash
cd frontend
npm run dev
# Runs on http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000)

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/assignments` | List all assignments |
| `POST` | `/api/assignments` | Create assignment + enqueue generation job |
| `GET` | `/api/assignments/:id/progress` | Poll generation progress |
| `DELETE` | `/api/assignments/:id` | Delete assignment |
| `GET` | `/api/papers` | List all papers (filter by subject/grade) |
| `GET` | `/api/papers/:id` | Get a question paper |
| `GET` | `/api/papers/by-assignment/:id` | Get paper by assignment ID |

---

## Key Design Decisions

- **Groq over OpenAI** — Groq's free tier (`llama-3.3-70b-versatile`) is fast and supports the token counts needed for 20+ question papers without cost
- **axios over Node fetch** — Node.js 18's built-in `fetch` corrupts binary/compressed responses from Groq; axios with `decompress: true` handles it correctly
- **BullMQ + Redis** — decouples generation from the HTTP request so the server never times out on long AI calls; also enables retry and progress tracking
- **Dynamic `max_tokens`** — calculated per-assignment (`questions × 220 + sections × 80 + 600`) to stay within Groq's 12,000 TPM free tier limit
- **`correctAnswer` in one AI call** — the answer key is generated alongside the questions (not a separate call), keeping generation fast and cost-free
- **`normalizeType()`** — the AI sometimes returns `truefalse`, `true/false`, or `mcq` in different casings; a normalizer maps all variants to the MongoDB enum values before saving
- **Startup cleanup** — on server boot, any assignments stuck in `processing` status (from a previous crash) are automatically marked as `failed` so the UI never shows a permanently spinning state
