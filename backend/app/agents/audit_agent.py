from app.agents.state import AgentState
from app.core.database import get_db
from app.services.audit_service import log_event
import logging

logger = logging.getLogger(__name__)


async def audit_agent(state: AgentState) -> AgentState:
    """
    Audit Agent:
    - Runs at the end of every pipeline
    - Records a summary audit log for the full pipeline run
    """
    db = get_db()
    meeting_id = state.get("meeting_id")

    summary = {
        "ingestion_done": state.get("ingestion_done", False),
        "planning_done": state.get("planning_done", False),
        "execution_done": state.get("execution_done", False),
        "tasks_count": len(state.get("extracted_tasks") or []),
        "error": state.get("error"),
    }

    await log_event(
        db=db,
        event="pipeline_completed",
        meeting_id=meeting_id,
        reason="Full agent pipeline finished",
        metadata=summary,
    )

    logger.info(f"[AuditAgent] Pipeline audit logged for meeting {meeting_id}: {summary}")
    return {**state, "audit_done": True}
