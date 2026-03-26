from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class AuditLogModel(BaseModel):
    id: Optional[str] = None
    event: str
    task_id: Optional[str] = None
    meeting_id: Optional[str] = None
    user_id: Optional[str] = None
    reason: Optional[str] = None
    metadata: Optional[dict] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
