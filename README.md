## AutoPilot

AutoPilot is an end‑to‑end "meeting to execution" platform. It ingests meeting data (transcripts, audio, or video), uses an agentic AI pipeline to extract structured tasks, persists them to MongoDB, and continuously monitors deadlines with notifications and recovery logic. The system exposes a FastAPI backend and a modern React/Next.js frontend.

This repository contains the complete full‑stack implementation.

---

## Repository Structure

- backend/ – FastAPI, MongoDB, and LangGraph agent pipeline.
- frontend/ – Next.js dashboard for meetings, tasks, and notifications.
- docs/ – Local project documentation (for example, AutoPilot.docx). These files are ignored by git and are intended for personal notes and design documents.

---

## Backend Overview

The backend service is implemented in FastAPI and organized under backend/app/:

- main.py – FastAPI application factory, lifespan, router registration, and CORS.
- core/ – Configuration, MongoDB connection, and security primitives (JWT and password hashing).
- models/ – Persistence models for users, meetings, tasks, meeting_data, notifications, and logs.
- schemas/ – Pydantic v2 request/response models for auth, meetings, meeting data, tasks, and notifications.
- routers/ – HTTP route definitions for authentication, meetings, tasks, and notifications.
- services/ – Business logic for each domain plus audit and recovery orchestration.
- agents/ – LangGraph agents and pipeline wiring the ingestion, planning, execution, monitoring, and recovery steps.
- workers/ – APScheduler‑based background monitor worker.

The backend exposes the following major capability areas:

- Authentication – /auth/signup and /auth/login issuing JWTs; all protected routes use a get_current_user dependency.
- Meetings – create, update, delete, list, and upload meeting data bound to participants.
- Tasks – create, list by meeting, update status, delete, and Human‑in‑the‑Loop task approval.
- Agentic pipeline – preview extraction and full background LangGraph runs triggered via the tasks router.
- Notifications – user‑scoped notifications with read/unread state and background generation from the monitor worker.

For a deep dive into the backend architecture and API reference, see backend/README.md.

---

## Frontend Overview

The frontend is a Next.js application located under frontend/ and uses React, TypeScript, and Tailwind CSS. Key elements include:

- app/ – Next.js App Router pages for login, signup, dashboard, meetings, and notifications.
- components/ – Reusable UI components for layouts, meeting cards, task cards, dialogs, and upload flows.
- context/ – app‑level context (AppProvider) and auth context implementing optimistic UI and local caching.
- services/ – API integration layer for authentication, meetings, tasks, and notifications.

The frontend uses a thin services layer (for example, frontend/services/meeting-service.ts) that talks to the FastAPI backend. All calls share a common configuration defined in frontend/services/api-config.ts:

- API_BASE_URL – configured via NEXT_PUBLIC_API_URL, defaulting to http://localhost:8000.
- getAuthHeaders – injects Authorization: Bearer <token> based on the JWT issued by the backend.

The UI is designed for demo reliability: when DEMO_FORCE_MOCKS is enabled or when an endpoint is unavailable, services fall back to realistic mock data while preserving a consistent user experience.

---

## Environment Configuration

Backend environment variables are defined in backend/.env.example and loaded by app/core/config.py. The most important settings are:

- MONGO_URI – MongoDB connection string (for example, mongodb://localhost:27017).
- MONGO_DB_NAME – Database name (default autopilot).
- JWT_SECRET_KEY – Secret key for signing JWT access tokens.
- GROQ_API_KEY – Groq API key for the LLM‑backed planner agent.
- GROQ_MODEL – Groq model name (for example, llama3-70b-8192).
- MONITOR_INTERVAL_SECONDS – Scheduler interval for the monitor worker.

For the frontend, the primary environment variables are:

- NEXT_PUBLIC_API_URL – Base URL of the FastAPI backend.
- NEXT_PUBLIC_DEMO_FORCE_MOCKS – When set to "true", forces frontend services to use mock data for safer demos.

---

## Local Development

### Backend

1. Install Python 3.11 or later and ensure MongoDB is running (either locally or via a hosted URI).
2. From the repository root, create and activate a virtual environment:

	```bash
	cd backend
	python -m venv venv
	venv\Scripts\activate
	```

3. Install dependencies and configure the environment:

	```bash
	pip install -r requirements.txt
	copy .env.example .env
	```

	Edit backend/.env and provide real values for MONGO_URI, JWT_SECRET_KEY, and GROQ_API_KEY.

4. Start the FastAPI server:

	```bash
	uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
	```

	The OpenAPI documentation is available at http://localhost:8000/docs.

### Frontend

1. Ensure Node.js and npm are installed.
2. From the repository root:

	```bash
	cd frontend
	npm install
	```

3. Optionally, create a .env.local file in frontend/ and set NEXT_PUBLIC_API_URL to point at your backend.

4. Run the development server:

	```bash
	npm run dev
	```

	The dashboard is served at http://localhost:3000.

---

## Testing

Backend tests are implemented with pytest under backend/tests/.

From backend/ with the virtual environment activated:

```bash
venv\Scripts\python -m pytest
```

The frontend can be validated with the usual Next.js linting and testing commands if configured (for example, npm run lint or npm test).

---

## Production Considerations

This repository is configured for local development and demo environments. For production deployments, consider the following adjustments:

- Replace mocked transcription and OCR functions in meeting_data_service.py with real integrations (for example, Whisper and Tesseract).
- Replace simulated email notifications in notification_service.py with a production‑grade provider.
- Harden JWT configuration, rotate secrets, and configure HTTPS termination in your API gateway.
- Deploy MongoDB using a managed service with backups and appropriate access controls.
- Configure environment variables via a secure secret manager rather than plain .env files.

---

## License and Contributions

This project is maintained in the Sakshamyadav15/AutoPilot repository. Contributions, issues, and feature requests are welcome via GitHub pull requests and issues.
