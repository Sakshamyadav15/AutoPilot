from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class CreateMeetingRequest(BaseModel):
    title: str


class AddParticipantsRequest(BaseModel):
    meeting_id: str
    participant_ids: List[str]


class UpdateMeetingRequest(BaseModel):
    """Partial update payload for a meeting.

    Currently we only support updating the title from the API, but this
    keeps the door open for adding more optional fields later without
    breaking existing clients.
    """

    title: Optional[str] = None


class MeetingResponse(BaseModel):
    id: str
    title: str
    owner_id: str
    participants: List[str]
    created_at: datetime
