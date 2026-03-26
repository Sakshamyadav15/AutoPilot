from app.agents.state import AgentState
from app.core.database import get_db
from app.utils.helpers import to_object_id
import logging

logger = logging.getLogger(__name__)


async def ingestion_agent(state: AgentState) -> AgentState:
    """
    Ingestion Agent:
    - Fetches the latest meeting data for the given meeting_id
    - Extracts the merged transcript/content
    - Sets state for downstream agents
    """
    db = get_db()
    meeting_id = state.get("meeting_id")

    if not meeting_id:
        return {**state, "error": "missing meeting_id", "ingestion_done": False}

    # Fetch the most recent meeting data document
    doc = await db.meeting_data.find_one(
        {"meeting_id": meeting_id},
        sort=[("created_at", -1)],
    )

    if not doc:
        return {**state, "error": f"No meeting data found for meeting {meeting_id}", "ingestion_done": False}

    transcript = doc.get("merged_content") or doc.get("transcript") or ""

    if not transcript.strip():
        return {**state, "error": "Transcript is empty", "ingestion_done": False}

    logger.info(f"[IngestionAgent] Loaded transcript for meeting {meeting_id} ({len(transcript)} chars)")
    return {
        **state,
        "transcript": transcript,
        "ingestion_done": True,
        "error": None,
    }
