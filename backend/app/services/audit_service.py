from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime
from typing import Optional
import logging

logger = logging.getLogger(__name__)


async def log_event(
    db: AsyncIOMotorDatabase,
    event: str,
    task_id: Optional[str] = None,
    meeting_id: Optional[str] = None,
    user_id: Optional[str] = None,
    reason: Optional[str] = None,
    metadata: Optional[dict] = None,
) -> None:
    doc = {
        "event": event,
        "task_id": task_id,
        "meeting_id": meeting_id,
        "user_id": user_id,
        "reason": reason,
        "metadata": metadata or {},
        "timestamp": datetime.utcnow(),
    }
    await db.logs.insert_one(doc)
    logger.info(f"[AUDIT] event={event} task={task_id} meeting={meeting_id} reason={reason}")
