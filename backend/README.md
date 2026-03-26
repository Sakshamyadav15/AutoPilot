# AutoPilot — AI Meeting to Execution System

> Converts meeting transcripts, audio, and video into AI-extracted, human-reviewed, automatically monitored task workflows.

---

## Architecture Overview

```
Meeting Data (text/audio/video)
        │
        ▼
┌─────────────────────────────────────────┐
│           LangGraph Pipeline            │
│                                         │
│  IngestionAgent → PlannerAgent (Groq)   │
│       → ExecutorAgent → AuditAgent      │
└─────────────────────────────────────────┘
        │
        ▼
  Tasks stored in MongoDB
        │
        ▼
  Background Monitor Worker (APScheduler)
        │
        ▼
  Recovery: Notify → Reassign → Audit Log
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| API Framework | FastAPI (async) |
| Database | MongoDB via Motor (async) |
| Agent Orchestration | LangGraph |
| LLM Provider | Groq (llama3-70b-8192) |
| Auth | JWT + bcrypt |
| Validation | Pydantic v2 |
| Scheduler | APScheduler |

---

## Folder Structure

```
backend/
├── app/
│   ├── main.py                  # FastAPI app, lifespan, router registration
│   ├── core/
│   │   ├── config.py            # Settings from .env
│   │   ├── database.py          # MongoDB connect/disconnect + index creation
│   │   └── security.py          # JWT creation, password hashing, auth dependency
│   ├── models/
│   │   ├── user.py
│   │   ├── meeting.py
│   │   ├── task.py
│   │   ├── meeting_data.py
│   │   ├── notification.py
│   │   └── log.py
│   ├── schemas/
│   │   ├── auth.py
│   │   ├── meeting.py
│   │   ├── task.py
│   │   ├── meeting_data.py
│   │   └── notification.py
│   ├── routers/
│   │   ├── auth_router.py
│   │   ├── meeting_router.py
│   │   ├── task_router.py
│   │   └── notification_router.py
│   ├── services/
│   │   ├── auth_service.py
│   │   ├── meeting_service.py
│   │   ├── task_service.py
│   │   ├── meeting_data_service.py
│   │   ├── notification_service.py
│   │   ├── recovery_service.py
│   │   └── audit_service.py
│   ├── agents/
│   │   ├── state.py             # Shared AgentState TypedDict
│   │   ├── ingestion_agent.py
│   │   ├── planner_agent.py     # Groq LLM task extraction
│   │   ├── executor_agent.py
│   │   ├── monitor_agent.py
│   │   ├── recovery_agent.py
│   │   └── pipeline.py          # LangGraph graph definition
│   ├── utils/
│   │   └── helpers.py           # serialize_doc, to_object_id
│   └── workers/
│       └── monitor_worker.py    # APScheduler background job
├── requirements.txt
├── .env.example
└── README.md
```

---

## Setup Instructions

### 1. Prerequisites

- Python 3.11+
- MongoDB running locally (`mongodb://localhost:27017`) or a MongoDB Atlas URI
- A [Groq API key](https://console.groq.com/) (free tier available)

### 2. Clone & Install

```bash
# Unzip the project
unzip autopilot-backend.zip
cd autopilot-backend/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
MONGO_URI=mongodb://localhost:27017
MONGO_DB_NAME=autopilot
JWT_SECRET_KEY=your-very-secret-key-here
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxx
GROQ_MODEL=llama3-70b-8192
MONITOR_INTERVAL_SECONDS=60
```

### 4. Run the Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at: **http://localhost:8000**

Interactive docs: **http://localhost:8000/docs**

---

## API Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/signup` | Register new user |
| POST | `/auth/login` | Login, receive JWT token |

All other routes require `Authorization: Bearer <token>` header.

### Meetings

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/meetings/create` | Create a meeting (owner only) |
| POST | `/meetings/add-participants` | Add participants by user ID |
| GET | `/meetings/{id}` | Get meeting details |
| POST | `/meetings/upload` | Upload meeting data (text/audio/video) |

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/tasks/create` | Create a task manually |
| GET | `/tasks/{meeting_id}` | List all tasks for a meeting |
| PATCH | `/tasks/update-status` | Update task status |
| POST | `/tasks/extract/{meeting_id}` | **AI preview** — extract tasks without saving |
| POST | `/tasks/approve` | **HITL** — approve and persist reviewed tasks |
| POST | `/tasks/run-pipeline/{meeting_id}` | Run full AI pipeline in background |

### Notifications

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notifications/{user_id}` | Get notifications for a user |

---

## End-to-End Workflow

```
1. POST /auth/signup          → Create users
2. POST /auth/login           → Get JWT token
3. POST /meetings/create      → Owner creates meeting
4. POST /meetings/add-participants → Add team members
5. POST /meetings/upload      → Upload transcript/audio/video
6. POST /tasks/extract/{id}   → AI extracts tasks (preview, no DB write)
7. POST /tasks/approve        → Human reviews + approves tasks → saved to DB
8. [Background] Monitor worker checks deadlines every 60s
9. [Auto] Overdue tasks → notifications sent + reassignment + audit log
```

---

## Agent Pipeline (LangGraph)

```
[ingestion_agent]
    Fetches merged transcript from meeting_data collection
        │
        ▼ (error → skip to audit)
[planner_agent]
    Calls Groq LLM → returns structured JSON task list
        │
        ▼ (error → skip to audit)
[executor_agent]
    Persists approved tasks to DB, marks meeting_data.processed=True
        │
        ▼
[audit_agent]
    Logs full pipeline summary to logs collection
```

---

## MongoDB Collections

| Collection | Purpose |
|---|---|
| `users` | Registered users |
| `meetings` | Meeting metadata |
| `tasks` | Extracted & approved tasks |
| `meeting_data` | Raw/processed transcripts |
| `notifications` | User notifications |
| `logs` | Audit trail of all events |

---

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017` |
| `MONGO_DB_NAME` | Database name | `autopilot` |
| `JWT_SECRET_KEY` | Secret for signing JWTs | *(required)* |
| `JWT_ALGORITHM` | JWT algorithm | `HS256` |
| `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` | Token lifetime | `60` |
| `GROQ_API_KEY` | Groq API key | *(required for LLM)* |
| `GROQ_MODEL` | Model to use | `llama3-70b-8192` |
| `MONITOR_INTERVAL_SECONDS` | Deadline check frequency | `60` |

---

## Notes

- **Audio/Video transcription** is mocked. Replace `mock_transcribe_audio` in `meeting_data_service.py` with OpenAI Whisper or any ASR service.
- **OCR** is mocked. Replace `mock_run_ocr` with Tesseract or similar.
- **Email notifications** are simulated via application logs. Integrate SendGrid, SMTP, or similar in `notification_service.py`.
- **Task reassignment** picks the first alternative participant. Extend `_mock_reassign` in `recovery_service.py` for workload-aware logic.
- If `GROQ_API_KEY` is not set, the planner returns a single placeholder task rather than crashing.
