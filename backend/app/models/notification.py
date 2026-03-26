from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class NotificationType(str, Enum):
    overdue = "overdue"
    reassigned = "reassigned"
    general = "general"


class NotificationModel(BaseModel):
    id: Optional[str] = None
    user_id: str
    message: str
    type: NotificationType = NotificationType.general
    read: bool = False
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        use_enum_values = True
