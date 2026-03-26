from motor.motor_asyncio import AsyncIOMotorDatabase
from app.services.notification_service import create_notification
from app.services.audit_service import log_event
from app.utils.helpers import to_object_id
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


async def handle_overdue_task(task: dict, db: AsyncIOMotorDatabase) -> None:
    """Recovery logic: notify assignee, mock-reassign, and log."""
    task_id = task.get("id") or str(task.get("_id", ""))
    assigned_to = task.get("assigned_to")
    meeting_id = task.get("meeting_id")

    # Step 1: Notify the assigned user
    if assigned_to:
        await create_notification(
            db=db,
            user_id=assigned_to,
            message=f"⚠️ Your task '{task.get('task', '')}' is overdue. Please update its status.",
            notif_type="overdue",
        )

    # Step 2: Mock reassignment — pick another participant from the meeting
    new_assignee = await _mock_reassign(meeting_id, assigned_to, db)

    if new_assignee and new_assignee != assigned_to:
        oid = to_object_id(task_id)
        if oid:
            await db.tasks.update_one(
                {"_id": oid},
                {"$set": {"assigned_to": new_assignee, "updated_at": datetime.utcnow()}},
            )

        await create_notification(
            db=db,
            user_id=new_assignee,
            message=f"📋 Task reassigned to you: '{task.get('task', '')}' (was overdue).",
            notif_type="reassigned",
        )
        reason = f"Reassigned from {assigned_to} to {new_assignee} due to overdue"
    else:
        reason = f"Overdue task detected, no reassignment possible"

    # Step 3: Audit log
    await log_event(
        db=db,
        event="task_recovery_triggered",
        task_id=task_id,
        meeting_id=meeting_id,
        reason=reason,
    )
    logger.info(f"Recovery triggered for task {task_id}: {reason}")


async def _mock_reassign(meeting_id: str, exclude_user: str, db: AsyncIOMotorDatabase):
    """Pick another participant from the meeting as the new assignee."""
    if not meeting_id:
        return None
    oid = to_object_id(meeting_id)
    if not oid:
        return None
    meeting = await db.meetings.find_one({"_id": oid})
    if not meeting:
        return None

    participants = meeting.get("participants", [])
    alternatives = [p for p in participants if p != exclude_user]
    return alternatives[0] if alternatives else None
