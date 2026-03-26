from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class TaskStatus(str, Enum):
    pending = "pending"
    in_progress = "in_progress"
    completed = "completed"
    overdue = "overdue"


class TaskPriority(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"


class TaskModel(BaseModel):
    id: Optional[str] = None
    meeting_id: str
    assigned_to: Optional[str] = None
    task: str
    deadline: Optional[datetime] = None
    status: TaskStatus = TaskStatus.pending
    priority: TaskPriority = TaskPriority.medium
    confidence: float = 0.0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        use_enum_values = True
