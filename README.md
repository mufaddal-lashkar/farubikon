# Farubikon - AI Support Portal

Farubikon is a multi-tenant, AI-powered support ticketing system.

## 🚀 Getting Started

### Prerequisites
- **Runtime**: [Bun](https://bun.sh/) (for Backend) and [Node.js 20+](https://nodejs.org/) (for Frontend)
- **Language**: [Python 3.10+](https://www.python.org/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)

---

## 🛠️ Service Setup

### 1. AI Service (Python/FastAPI)
The brain of the system, handling ticket classification and response suggestions.

1. Navigate to directory: `cd ai-service`
2. Create virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install fastapi uvicorn langchain-openai langchain-anthropic python-dotenv
   ```
4. Configure environment:
   ```bash
   cp .env.example .env
   # Add your LLM API keys (OpenAI, Anthropic, or Groq)
   ```
5. Run service:
   ```bash
   python -m src.main
   ```
   *Service runs on `http://localhost:8000`*

### 2. Backend (Bun/Elysia)
The orchestration layer and API gateway.

1. Navigate to directory: `cd backend`
2. Install dependencies:
   ```bash
   bun install
   ```
3. Configure environment:
   ```bash
   cp .env.example .env
   # Set your DATABASE_URL (PostgreSQL) and BETTER_AUTH_SECRET
   ```
4. Initialize Database:
   ```bash
   bun run db:generate
   bun run db:push
   ```
5. Run service:
   ```bash
   bun run dev
   ```
   *Service runs on `http://localhost:3001`*

### 3. Frontend (Next.js)
The agent and user dashboard.

1. Navigate to directory: `cd frontend`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment:
   ```bash
   cp .env.example .env
   # Set NEXT_PUBLIC_API_URL to http://localhost:3001
   ```
4. Run service:
   ```bash
   npm run dev
   ```
   *Service runs on `http://localhost:3000`*

---

## 🔑 Environment Variables

### Backend (`/backend/.env`)
- `DATABASE_URL`: Your PostgreSQL connection string.
- `PORT`: Server port (default 3001).
- `BETTER_AUTH_SECRET`: A long random string for auth security.
- `AI_SERVICE_URL`: URL of the running AI service.

### AI Service (`/ai-service/.env`)
- `OPENAI_API_KEY` / `ANTHROPIC_API_KEY`: Keys for LLM generation.
- `LLM_PROVIDER`: `openai`, `anthropic`, or `groq`.
- `LLM_MODEL`: Model name (e.g., `gpt-4o-mini`).

---

## 📝 Assumptions & Limitations
- **Organization Auto-creation**: During signup, a new organization is automatically created and assigned to the user.
- **Reporter Discovery**: Tickets automatically use the authenticated user's name/email; standalone "guest" tickets are not supported in this version.
- **Database**: Drizzle is used with the `pg` driver; assumes a standard PostgreSQL instance is available.
