from app.agents.state import AgentState
from app.core.database import get_db
from app.services.recovery_service import handle_overdue_task
from app.utils.helpers import serialize_doc
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


async def monitor_agent(state: AgentState) -> AgentState:
    """
    Monitor Agent:
    - Scans all non-completed tasks
    - Marks overdue tasks
    - Triggers recovery for each overdue task
    """
    db = get_db()
    now = datetime.utcnow()

    # Find tasks that are pending/in_progress and past deadline
    cursor = db.tasks.find({
        "status": {"$in": ["pending", "in_progress"]},
        "deadline": {"$lt": now, "$ne": None},
    })
    overdue_tasks = await cursor.to_list(length=None)

    if not overdue_tasks:
        logger.info("[MonitorAgent] No overdue tasks found.")
        return {**state, "error": None}

    logger.info(f"[MonitorAgent] Found {len(overdue_tasks)} overdue tasks")

    for task in overdue_tasks:
        task_doc = serialize_doc(task)
        # Mark as overdue
        await db.tasks.update_one(
            {"_id": task["_id"]},
            {"$set": {"status": "overdue", "updated_at": now}},
        )
        task_doc["status"] = "overdue"
        # Trigger recovery
        await handle_overdue_task(task_doc, db)

    return {**state, "error": None}
