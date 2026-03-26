from app.agents.state import AgentState
from app.core.config import settings
from groq import AsyncGroq
import json
import logging

logger = logging.getLogger(__name__)

PLANNER_SYSTEM_PROMPT = """You are an expert meeting analyst and project manager.
Your job is to extract actionable tasks from meeting transcripts.

Return ONLY a valid JSON array. No explanation, no markdown, no preamble.
Each task object must contain exactly these fields:
- "task": string — clear, actionable description
- "assigned_to": string | null — person's name (if mentioned), otherwise null
- "deadline": string | null — ISO 8601 date string (e.g. "2024-12-31T00:00:00"), otherwise null
- "priority": "low" | "medium" | "high"
- "confidence": float between 0.0 and 1.0

Example output:
[
  {
    "task": "Prepare Q3 financial report",
    "assigned_to": "Alice",
    "deadline": "2024-07-31T00:00:00",
    "priority": "high",
    "confidence": 0.92
  }
]
"""


async def planner_agent(state: AgentState) -> AgentState:
    """
    Planner Agent:
    - Takes transcript from state
    - Calls Groq LLM with prompt engineering
    - Returns structured JSON task list
    """
    if not state.get("ingestion_done"):
        return {**state, "error": "Ingestion not complete", "planning_done": False}

    transcript = state.get("transcript", "")
    if not transcript.strip():
        return {**state, "error": "Empty transcript", "planning_done": False}

    if not settings.GROQ_API_KEY:
        logger.warning("[PlannerAgent] GROQ_API_KEY not set, returning mock tasks")
        mock_tasks = [
            {
                "task": "Follow up on action items from this meeting",
                "assigned_to": None,
                "deadline": None,
                "priority": "medium",
                "confidence": 0.5,
            }
        ]
        return {**state, "extracted_tasks": mock_tasks, "planning_done": True, "error": None}

    client = AsyncGroq(api_key=settings.GROQ_API_KEY)

    try:
        response = await client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[
                {"role": "system", "content": PLANNER_SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": f"Extract all tasks from this meeting transcript:\n\n{transcript}",
                },
            ],
            temperature=0.2,
            max_tokens=2048,
        )

        raw = response.choices[0].message.content.strip()

        # Strip markdown code fences if present
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        raw = raw.strip()

        tasks = json.loads(raw)
        if not isinstance(tasks, list):
            tasks = [tasks]

        logger.info(f"[PlannerAgent] Extracted {len(tasks)} tasks for meeting {state.get('meeting_id')}")
        return {**state, "extracted_tasks": tasks, "planning_done": True, "error": None}

    except json.JSONDecodeError as e:
        logger.error(f"[PlannerAgent] JSON parse error: {e} | Raw: {raw[:300]}")
        return {**state, "error": f"LLM returned invalid JSON: {e}", "planning_done": False}
    except Exception as e:
        logger.error(f"[PlannerAgent] Groq API error: {e}")
        return {**state, "error": str(e), "planning_done": False}
