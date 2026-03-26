from fastapi import APIRouter, Depends, BackgroundTasks, status
from app.schemas.task import CreateTaskRequest, UpdateTaskStatusRequest, ApproveTasksRequest
from app.services.task_service import (
    create_task,
    get_tasks_by_meeting,
    update_task_status,
    delete_task,
    approve_tasks,
)
from app.agents.pipeline import run_pipeline
from app.core.security import get_current_user
from app.core.database import get_db

router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.post("/create", status_code=201)
async def create_task_route(
    request: CreateTaskRequest,
    current_user=Depends(get_current_user),
    db=Depends(get_db),
):
    return await create_task(request, db=db)


@router.get("/{meeting_id}")
async def get_tasks_route(
    meeting_id: str,
    current_user=Depends(get_current_user),
    db=Depends(get_db),
):
    return await get_tasks_by_meeting(meeting_id, db=db)


@router.patch("/update-status")
async def update_task_status_route(
    request: UpdateTaskStatusRequest,
    current_user=Depends(get_current_user),
    db=Depends(get_db),
):
    return await update_task_status(request, db=db)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task_route(
    task_id: str,
    current_user=Depends(get_current_user),
    db=Depends(get_db),
):
    await delete_task(task_id, db=db)
    return None


@router.post("/approve", status_code=201)
async def approve_tasks_route(
    request: ApproveTasksRequest,
    current_user=Depends(get_current_user),
    db=Depends(get_db),
):
    """
    Human-in-the-Loop (HITL) endpoint.
    User reviews and submits approved/edited tasks.
    Tasks are persisted to the database.
    """
    return await approve_tasks(request, db=db)


@router.post("/run-pipeline/{meeting_id}", status_code=202)
async def run_pipeline_route(
    meeting_id: str,
    background_tasks: BackgroundTasks,
    current_user=Depends(get_current_user),
):
    """
    Triggers the full LangGraph AI pipeline for a meeting.
    Runs as a background task; poll /tasks/{meeting_id} for results.
    """
    background_tasks.add_task(run_pipeline, meeting_id)
    return {"message": f"Pipeline started for meeting {meeting_id}", "meeting_id": meeting_id}


@router.post("/extract/{meeting_id}", status_code=200)
async def extract_tasks_preview_route(
    meeting_id: str,
    current_user=Depends(get_current_user),
):
    """
    Runs ingestion + planner agents only (no DB write).
    Returns extracted tasks for human review before approval.
    """
    from app.agents.ingestion_agent import ingestion_agent
    from app.agents.planner_agent import planner_agent

    state = {"meeting_id": meeting_id, "metadata": {}}
    state = await ingestion_agent(state)
    if state.get("error"):
        return {"error": state["error"], "tasks": []}
    state = await planner_agent(state)
    if state.get("error"):
        return {"error": state["error"], "tasks": []}

    return {
        "meeting_id": meeting_id,
        "tasks": state.get("extracted_tasks", []),
        "message": "Review these tasks and submit to POST /tasks/approve to persist them.",
    }
