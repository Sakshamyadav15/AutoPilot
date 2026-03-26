from motor.motor_asyncio import AsyncIOMotorDatabase
from fastapi import HTTPException
from app.schemas.meeting_data import UploadMeetingDataRequest
from app.utils.helpers import serialize_doc, to_object_id
from app.services.audit_service import log_event
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


def mock_transcribe_audio(content: str) -> str:
    """Mock audio transcription — replace with Whisper or other ASR in production."""
    logger.info("Mock audio transcription called")
    return f"[TRANSCRIBED AUDIO] {content}"


def mock_extract_audio_from_video(content: str) -> str:
    """Mock video-to-audio extraction."""
    logger.info("Mock video audio extraction called")
    return f"[EXTRACTED AUDIO FROM VIDEO] {content}"


def mock_run_ocr(content: str) -> str:
    """Mock OCR processing."""
    logger.info("Mock OCR called")
    return f"[OCR OUTPUT] {content}"


async def upload_meeting_data(
    request: UploadMeetingDataRequest, db: AsyncIOMotorDatabase
) -> dict:
    # Validate meeting exists
    meeting_oid = to_object_id(request.meeting_id)
    if not meeting_oid:
        raise HTTPException(status_code=400, detail="Invalid meeting ID")

    meeting = await db.meetings.find_one({"_id": meeting_oid})
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    transcript = request.content

    # Process based on input type
    if request.input_type == "audio":
        transcript = mock_transcribe_audio(request.content)
    elif request.input_type == "video":
        audio = mock_extract_audio_from_video(request.content)
        transcript = mock_transcribe_audio(audio)

    # Run OCR if requested
    ocr_data = None
    if request.run_ocr:
        ocr_data = mock_run_ocr(request.content)

    # Merge transcript + OCR
    merged = transcript
    if ocr_data:
        merged = f"{transcript}\n\n[OCR DATA]:\n{ocr_data}"

    doc = {
        "meeting_id": request.meeting_id,
        "input_type": request.input_type,
        "raw_content": request.content,
        "transcript": transcript,
        "ocr_data": ocr_data,
        "merged_content": merged,
        "processed": False,
        "created_at": datetime.utcnow(),
    }

    result = await db.meeting_data.insert_one(doc)
    doc["_id"] = result.inserted_id

    await log_event(
        db=db,
        event="meeting_data_uploaded",
        meeting_id=request.meeting_id,
        reason=f"Input type: {request.input_type}, OCR: {request.run_ocr}",
    )
    logger.info(f"Meeting data uploaded for meeting {request.meeting_id}")
    return serialize_doc(doc)
