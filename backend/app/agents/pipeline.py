from langgraph.graph import StateGraph, END
from app.agents.state import AgentState
from app.agents.ingestion_agent import ingestion_agent
from app.agents.planner_agent import planner_agent
from app.agents.executor_agent import executor_agent
from app.agents.audit_agent import audit_agent
import logging

logger = logging.getLogger(__name__)


def should_continue_after_ingestion(state: AgentState) -> str:
    if state.get("error") or not state.get("ingestion_done"):
        return "audit"
    return "planner"


def should_continue_after_planning(state: AgentState) -> str:
    if state.get("error") or not state.get("planning_done"):
        return "audit"
    return "executor"


def should_continue_after_execution(state: AgentState) -> str:
    return "audit"


def build_pipeline() -> StateGraph:
    graph = StateGraph(AgentState)

    graph.add_node("ingestion", ingestion_agent)
    graph.add_node("planner", planner_agent)
    graph.add_node("executor", executor_agent)
    graph.add_node("audit", audit_agent)

    graph.set_entry_point("ingestion")

    graph.add_conditional_edges(
        "ingestion",
        should_continue_after_ingestion,
        {"planner": "planner", "audit": "audit"},
    )
    graph.add_conditional_edges(
        "planner",
        should_continue_after_planning,
        {"executor": "executor", "audit": "audit"},
    )
    graph.add_conditional_edges(
        "executor",
        should_continue_after_execution,
        {"audit": "audit"},
    )
    graph.add_edge("audit", END)

    return graph.compile()


# Singleton compiled pipeline
_pipeline = None


def get_pipeline():
    global _pipeline
    if _pipeline is None:
        _pipeline = build_pipeline()
    return _pipeline


async def run_pipeline(meeting_id: str, approved_tasks: list = None) -> AgentState:
    """
    Entry point for running the full agent pipeline.
    If approved_tasks is provided, the executor will use them (post-HITL).
    """
    pipeline = get_pipeline()
    initial_state: AgentState = {
        "meeting_id": meeting_id,
        "approved_tasks": approved_tasks or [],
        "metadata": {},
    }

    logger.info(f"[Pipeline] Starting pipeline for meeting {meeting_id}")
    final_state = await pipeline.ainvoke(initial_state)
    logger.info(f"[Pipeline] Completed for meeting {meeting_id} | error={final_state.get('error')}")
    return final_state
