from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.task import TaskStatus, TaskPriority


class CreateTaskRequest(BaseModel):
    meeting_id: str
    assigned_to: Optional[str] = None
    task: str
    deadline: Optional[datetime] = None
    priority: TaskPriority = TaskPriority.medium
    confidence: float = 1.0


class UpdateTaskStatusRequest(BaseModel):
    task_id: str
    status: TaskStatus


class TaskResponse(BaseModel):
    id: str
    meeting_id: str
    assigned_to: Optional[str]
    task: str
    deadline: Optional[datetime]
    status: str
    priority: str
    confidence: float
    created_at: datetime
    updated_at: datetime


class ApproveTasksRequest(BaseModel):
    meeting_id: str
    tasks: List[CreateTaskRequest]
