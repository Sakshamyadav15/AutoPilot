from fastapi import HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.schemas.task import CreateTaskRequest, UpdateTaskStatusRequest, ApproveTasksRequest
from app.utils.helpers import serialize_doc, serialize_docs, to_object_id
from app.services.audit_service import log_event
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


async def create_task(request: CreateTaskRequest, db: AsyncIOMotorDatabase) -> dict:
    doc = {
        "meeting_id": request.meeting_id,
        "assigned_to": request.assigned_to,
        "task": request.task,
        "deadline": request.deadline,
        "status": "pending",
        "priority": request.priority,
        "confidence": request.confidence,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }
        result = await db.tasks.insert_one(doc)
    doc["_id"] = result.inserted_id
    task_id = str(result.inserted_id)

    await log_event(
        db=db,
        event="task_created",
        task_id=task_id,
        meeting_id=request.meeting_id,
        reason="Task created via API",
    )
    return serialize_doc(doc)


async def get_tasks_by_meeting(meeting_id: str, db: AsyncIOMotorDatabase) -> list:
    cursor = db.tasks.find({"meeting_id": meeting_id})
    tasks = await cursor.to_list(length=None)
    return serialize_docs(tasks)


async def update_task_status(request: UpdateTaskStatusRequest, db: AsyncIOMotorDatabase) -> dict:
    oid = to_object_id(request.task_id)
    if not oid:
        raise HTTPException(status_code=400, detail="Invalid task ID")

    task = await db.tasks.find_one({"_id": oid})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    await db.tasks.update_one(
        {"_id": oid},
        {"$set": {"status": request.status, "updated_at": datetime.utcnow()}},
    )
    updated = await db.tasks.find_one({"_id": oid})

    await log_event(
        db=db,
        event="task_status_updated",
        task_id=request.task_id,
        reason=f"Status changed to {request.status}",
    )
    return serialize_doc(updated)


async def delete_task(task_id: str, db: AsyncIOMotorDatabase) -> None:
    """Delete a single task by id.

    This is primarily useful for manual cleanup or UI actions; the
    agentic pipeline typically updates status rather than deleting.
    """

    oid = to_object_id(task_id)
    if not oid:
        raise HTTPException(status_code=400, detail="Invalid task ID")

    task = await db.tasks.find_one({"_id": oid})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    await db.tasks.delete_one({"_id": oid})

    await log_event(
        db=db,
        event="task_deleted",
        task_id=task_id,
        meeting_id=task.get("meeting_id"),
        reason="Task deleted via API",
    )
    logger.info(f"Task {task_id} deleted")


async def approve_tasks(request: ApproveTasksRequest, db: AsyncIOMotorDatabase) -> list:
    """HITL: Insert reviewed/approved tasks into the database."""
    inserted = []
    for task_req in request.tasks:
        task_req.meeting_id = request.meeting_id
        task_doc = await create_task(task_req, db)
        inserted.append(task_doc)

    await log_event(
        db=db,
        event="tasks_approved",
        meeting_id=request.meeting_id,
        reason=f"{len(inserted)} tasks approved via HITL",
    )
    logger.info(f"{len(inserted)} tasks approved for meeting {request.meeting_id}")
    return inserted
