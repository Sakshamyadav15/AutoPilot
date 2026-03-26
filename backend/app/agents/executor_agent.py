from app.agents.state import AgentState
from app.core.database import get_db
from app.services.audit_service import log_event
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


async def executor_agent(state: AgentState) -> AgentState:
    """
    Executor Agent:
    - Takes approved tasks from state (post-HITL)
    - Persists them to the database
    - Updates meeting_data.processed = True
    """
    if not state.get("planning_done"):
        return {**state, "error": "Planning not complete", "execution_done": False}

    approved_tasks = state.get("approved_tasks") or state.get("extracted_tasks", [])
    meeting_id = state.get("meeting_id")

    if not approved_tasks:
        return {**state, "error": "No tasks to execute", "execution_done": False}

    db = get_db()
    inserted_ids = []

    for task in approved_tasks:
        doc = {
            "meeting_id": meeting_id,
            "assigned_to": task.get("assigned_to"),
            "task": task.get("task", ""),
            "deadline": _parse_deadline(task.get("deadline")),
            "status": "pending",
            "priority": task.get("priority", "medium"),
            "confidence": float(task.get("confidence", 0.0)),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }
        result = await db.tasks.insert_one(doc)
        inserted_ids.append(str(result.inserted_id))

    # Mark meeting data as processed
    await db.meeting_data.update_many(
        {"meeting_id": meeting_id, "processed": False},
        {"$set": {"processed": True}},
    )

    await log_event(
        db=db,
        event="tasks_executed",
        meeting_id=meeting_id,
        reason=f"Executor persisted {len(inserted_ids)} tasks",
        metadata={"task_ids": inserted_ids},
    )

    logger.info(f"[ExecutorAgent] Persisted {len(inserted_ids)} tasks for meeting {meeting_id}")
    return {**state, "execution_done": True, "error": None}


def _parse_deadline(value) -> datetime | None:
    if not value:
        return None
    if isinstance(value, datetime):
        return value
    try:
        return datetime.fromisoformat(str(value))
    except Exception:
        return None
