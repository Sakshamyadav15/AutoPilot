from app.agents.state import AgentState
from app.core.database import get_db
from app.services.recovery_service import handle_overdue_task
from app.utils.helpers import serialize_doc
import logging

logger = logging.getLogger(__name__)


async def recovery_agent(state: AgentState) -> AgentState:
    """
    Recovery Agent:
    - Dedicated agent that processes overdue tasks for a specific meeting
    - Can be called independently of the monitor cycle
    """
    db = get_db()
    meeting_id = state.get("meeting_id")

    query = {"status": "overdue"}
    if meeting_id:
        query["meeting_id"] = meeting_id

    cursor = db.tasks.find(query)
    tasks = await cursor.to_list(length=None)

    if not tasks:
        logger.info(f"[RecoveryAgent] No overdue tasks to recover for meeting {meeting_id}")
        return {**state, "error": None}

    for task in tasks:
        await handle_overdue_task(serialize_doc(task), db)

    logger.info(f"[RecoveryAgent] Recovery complete for {len(tasks)} tasks")
    return {**state, "error": None}
