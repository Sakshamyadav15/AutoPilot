from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class InputType(str, Enum):
    text = "text"
    audio = "audio"
    video = "video"


class MeetingDataModel(BaseModel):
    id: Optional[str] = None
    meeting_id: str
    input_type: InputType
    raw_content: Optional[str] = None
    transcript: Optional[str] = None
    ocr_data: Optional[str] = None
    merged_content: Optional[str] = None
    processed: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        use_enum_values = True
