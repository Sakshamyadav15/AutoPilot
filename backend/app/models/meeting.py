from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class MeetingModel(BaseModel):
    id: Optional[str] = None
    title: str
    owner_id: str
    participants: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
