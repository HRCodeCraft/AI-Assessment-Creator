# VedaAI – AI Assessment Creator

An AI-powered assessment creator that lets teachers generate structured question papers using Claude AI, with real-time progress via WebSockets.

## Architecture

```
┌─────────────────────┐     REST + WebSocket     ┌──────────────────────────┐
│   Next.js Frontend  │ ◄──────────────────────► │  Express Backend (3001)   │
│   (Port 3000)       │                           │                          │
│                     │                           │  ┌─────────────────────┐ │
│  • Dashboard        │                           │  │  MongoDB             │ │
│  • Create Form      │                           │  │  (assignments +      │ │
│  • Paper View       │                           │  │   papers)            │ │
│                     │                           │  └─────────────────────┘ │
│  State: Zustand     │                           │  ┌─────────────────────┐ │
│  Socket: socket.io  │                           │  │  Redis               │ │
└─────────────────────┘                           │  │  (job state cache)   │ │
                                                  │  └─────────────────────┘ │
                                                  │  ┌─────────────────────┐ │
                                                  │  │  BullMQ Worker       │ │
                                                  │  │  (Claude AI calls)   │ │
                                                  │  └─────────────────────┘ │
                                                  └──────────────────────────┘
```

**Generation Flow:**
1. Teacher fills 4-step form → POST `/api/assignments`
2. Server creates MongoDB doc, enqueues BullMQ job
3. Frontend joins WebSocket room `assignment:{id}`
4. Worker calls Claude (streaming), emits progress events
5. Paper stored in MongoDB → `generation:complete` event
6. Frontend navigates to `/paper/{paperId}`

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Framer Motion, Zustand, socket.io-client |
| Backend | Node.js, Express, TypeScript, BullMQ |
| Database | MongoDB (Mongoose) |
| Cache / Queue | Redis, BullMQ |
| Realtime | Socket.io |
| AI | Claude Sonnet 4.6 (Anthropic SDK, streaming) |
| PDF Export | html2canvas + jsPDF |

## Setup

### Prerequisites
- Node.js 18+
- Docker + Docker Compose (for MongoDB + Redis)
- Anthropic API Key

### 1. Clone & install

```bash
# Backend
cd backend
npm install
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

# Frontend
cd ../frontend
npm install
cp .env.local.example .env.local
```

### 2. Start infrastructure

```bash
# From project root
docker-compose up -d
```

### 3. Start backend

```bash
cd backend
npm run dev
```

### 4. Start frontend

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Features

- **4-step assignment creation** – basic info, question setup (dynamic type rows with count/marks), difficulty distribution, review
- **AI generation** – structured JSON from Claude, parsed into typed sections
- **Real-time progress** – Socket.io events with step-by-step progress overlay
- **Redis fallback polling** – if WebSocket drops, frontend polls `/assignments/:id/progress`
- **Exam paper output** – school header, student info lines, section-wise questions with inline difficulty tags, answer key
- **PDF export** – html2canvas + jsPDF, multi-page support
- **Assignment dashboard** – filter/search, 2-col grid, status badges, 3-dot menus
