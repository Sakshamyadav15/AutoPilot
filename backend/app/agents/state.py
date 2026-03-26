from typing import TypedDict, Optional, List, Any


class AgentState(TypedDict, total=False):
    """Shared state passed between all agents in the LangGraph pipeline."""
    meeting_id: str
    transcript: str
    extracted_tasks: List[dict]   # raw JSON from Planner
    approved_tasks: List[dict]    # after HITL approval
    ingestion_done: bool
    planning_done: bool
    execution_done: bool
    audit_done: bool
    error: Optional[str]
    metadata: dict
