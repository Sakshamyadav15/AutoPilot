from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from app.schemas.meeting import CreateMeetingRequest, AddParticipantsRequest, UpdateMeetingRequest
from app.utils.helpers import serialize_doc, serialize_docs, to_object_id
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


async def create_meeting(request: CreateMeetingRequest, owner_id: str, db: AsyncIOMotorDatabase) -> dict:
    doc = {
        "title": request.title,
        "owner_id": owner_id,
        "participants": [owner_id],
        "created_at": datetime.utcnow(),
    }
    result = await db.meetings.insert_one(doc)
    doc["_id"] = result.inserted_id
    logger.info(f"Meeting created: {result.inserted_id} by owner {owner_id}")
    return serialize_doc(doc)


async def add_participants(request: AddParticipantsRequest, owner_id: str, db: AsyncIOMotorDatabase) -> dict:
    meeting_oid = to_object_id(request.meeting_id)
    if not meeting_oid:
        raise HTTPException(status_code=400, detail="Invalid meeting ID")

    meeting = await db.meetings.find_one({"_id": meeting_oid})
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    if str(meeting["owner_id"]) != owner_id:
        raise HTTPException(status_code=403, detail="Only the meeting owner can add participants")

    # Validate all participant IDs are registered users
    valid_ids = []
    for pid in request.participant_ids:
        oid = to_object_id(pid)
        if oid:
            user = await db.users.find_one({"_id": oid})
            if user:
                valid_ids.append(pid)
            else:
                logger.warning(f"Participant {pid} not found, skipping")
        else:
            logger.warning(f"Invalid participant ID format: {pid}, skipping")

    if not valid_ids:
        raise HTTPException(status_code=400, detail="No valid participant IDs provided")

    # Merge without duplicates
    existing = set(meeting.get("participants", []))
    new_participants = list(existing | set(valid_ids))

    await db.meetings.update_one(
        {"_id": meeting_oid},
        {"$set": {"participants": new_participants}},
    )
    updated = await db.meetings.find_one({"_id": meeting_oid})
    logger.info(f"Participants added to meeting {request.meeting_id}")
    return serialize_doc(updated)


async def update_meeting(
    meeting_id: str,
    request: UpdateMeetingRequest,
    user_id: str,
    db: AsyncIOMotorDatabase,
) -> dict:
    """Update mutable meeting fields (currently just the title).

    Only the meeting owner is allowed to perform updates.
    """

    oid = to_object_id(meeting_id)
    if not oid:
        raise HTTPException(status_code=400, detail="Invalid meeting ID")

    meeting = await db.meetings.find_one({"_id": oid})
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    if str(meeting["owner_id"]) != user_id:
        raise HTTPException(status_code=403, detail="Only the meeting owner can update this meeting")

    update_data = {}
    if request.title is not None and request.title != meeting.get("title"):
        update_data["title"] = request.title

    if not update_data:
        # Nothing to change; return the existing document.
        return serialize_doc(meeting)

    await db.meetings.update_one({"_id": oid}, {"$set": update_data})
    updated = await db.meetings.find_one({"_id": oid})
    logger.info(f"Meeting {meeting_id} updated by owner {user_id}")
    return serialize_doc(updated)


async def delete_meeting(meeting_id: str, user_id: str, db: AsyncIOMotorDatabase) -> None:
    """Delete a meeting and its associated data.

    This removes the meeting itself, any meeting_data documents, and any
    tasks linked to this meeting. Only the owner may delete.
    """

    oid = to_object_id(meeting_id)
    if not oid:
        raise HTTPException(status_code=400, detail="Invalid meeting ID")

    meeting = await db.meetings.find_one({"_id": oid})
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    if str(meeting["owner_id"]) != user_id:
        raise HTTPException(status_code=403, detail="Only the meeting owner can delete this meeting")

    await db.meetings.delete_one({"_id": oid})
    await db.meeting_data.delete_many({"meeting_id": meeting_id})
    await db.tasks.delete_many({"meeting_id": meeting_id})

    logger.info(f"Meeting {meeting_id} and related data deleted by owner {user_id}")


async def get_meeting(meeting_id: str, user_id: str, db: AsyncIOMotorDatabase) -> dict:
    oid = to_object_id(meeting_id)
    if not oid:
        raise HTTPException(status_code=400, detail="Invalid meeting ID")

    meeting = await db.meetings.find_one({"_id": oid})
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    # Only owner or participants can view
    all_members = set(meeting.get("participants", [])) | {str(meeting["owner_id"])}
    if user_id not in all_members:
        raise HTTPException(status_code=403, detail="Access denied")

    return serialize_doc(meeting)


async def get_user_meetings(user_id: str, db: AsyncIOMotorDatabase) -> list:
    cursor = db.meetings.find({
        "$or": [
            {"owner_id": user_id},
            {"participants": user_id}
        ]
    }).sort("created_at", -1)
    meetings = await cursor.to_list(length=None)
    return serialize_docs(meetings)
