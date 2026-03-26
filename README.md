# AutoPilot - Project Root

This is the root directory for the AutoPilot project. It has been restructured to ensure a clean workspace for full-stack development.

## Structure

- `/frontend/`: Contains the fully integrated React + Vite frontend application.
- `/backend/`: Contains the FastAPI + MongoDB backend application. A Python virtual environment (`venv`) is initialized here with all dependencies installed.
- `/docs/`: Contains project architecture and requirement documentation (e.g. `AutoPilot.docx`).
- `/frontend_nextjs_archive/`: A backup of the legacy Next.js files previously scattered in the root directory.

## Running the Application

**Backend:**
```bash
cd backend
.\venv\Scripts\activate
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm run dev
```
