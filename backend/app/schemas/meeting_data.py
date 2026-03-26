from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.meeting_data import InputType


class UploadMeetingDataRequest(BaseModel):
    meeting_id: str
    input_type: InputType
    content: str
    run_ocr: bool = False


class MeetingDataResponse(BaseModel):
    id: str
    meeting_id: str
    input_type: str
    transcript: Optional[str]
    ocr_data: Optional[str]
    merged_content: Optional[str]
    processed: bool
    created_at: datetime
