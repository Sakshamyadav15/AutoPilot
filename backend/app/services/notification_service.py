from motor.motor_asyncio import AsyncIOMotorDatabase
from app.utils.helpers import serialize_doc, serialize_docs, to_object_id
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


async def create_notification(
    db: AsyncIOMotorDatabase,
    user_id: str,
    message: str,
    notif_type: str = "general",
) -> dict:
    doc = {
        "user_id": user_id,
        "message": message,
        "type": notif_type,
        "read": False,
        "timestamp": datetime.utcnow(),
    }
    result = await db.notifications.insert_one(doc)
    doc["_id"] = result.inserted_id

    # Simulate email via log
    logger.info(f"[EMAIL SIMULATION] To user {user_id}: {message}")
    return serialize_doc(doc)


async def get_notifications(user_id: str, db: AsyncIOMotorDatabase) -> list:
    cursor = db.notifications.find({"user_id": user_id}).sort("timestamp", -1)
    docs = await cursor.to_list(length=100)
    return serialize_docs(docs)


async def mark_notification_read(
    notification_id: str,
    user_id: str,
    db: AsyncIOMotorDatabase,
) -> dict:
    """Mark a single notification as read for the given user."""

    oid = to_object_id(notification_id)
    if not oid:
        from fastapi import HTTPException

        raise HTTPException(status_code=400, detail="Invalid notification ID")

    doc = await db.notifications.find_one({"_id": oid})
    if not doc:
        from fastapi import HTTPException

        raise HTTPException(status_code=404, detail="Notification not found")

    if doc.get("user_id") != user_id:
        from fastapi import HTTPException

        raise HTTPException(status_code=403, detail="Access denied")

    await db.notifications.update_one(
        {"_id": oid},
        {"$set": {"read": True}},
    )
    updated = await db.notifications.find_one({"_id": oid})
    return serialize_doc(updated)


async def mark_all_notifications_read(user_id: str, db: AsyncIOMotorDatabase) -> int:
    """Mark all notifications for the current user as read.

    Returns the number of notifications affected.
    """

    result = await db.notifications.update_many(
        {"user_id": user_id, "read": False},
        {"$set": {"read": True}},
    )
    logger.info(f"Marked {result.modified_count} notifications as read for user {user_id}")
    return result.modified_count


async def delete_notification(notification_id: str, user_id: str, db: AsyncIOMotorDatabase) -> None:
    """Delete a single notification belonging to the user."""

    oid = to_object_id(notification_id)
    if not oid:
        from fastapi import HTTPException

        raise HTTPException(status_code=400, detail="Invalid notification ID")

    doc = await db.notifications.find_one({"_id": oid})
    if not doc:
        from fastapi import HTTPException

        raise HTTPException(status_code=404, detail="Notification not found")

    if doc.get("user_id") != user_id:
        from fastapi import HTTPException

        raise HTTPException(status_code=403, detail="Access denied")

    await db.notifications.delete_one({"_id": oid})
    logger.info(f"Notification {notification_id} deleted for user {user_id}")
