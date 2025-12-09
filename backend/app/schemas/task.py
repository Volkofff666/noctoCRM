from pydantic import BaseModel
from datetime import datetime, date
from typing import Optional

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    priority: str = "medium"
    due_date: Optional[date] = None

class TaskCreate(TaskBase):
    deal_id: Optional[int] = None
    client_id: Optional[int] = None
    assignee_id: Optional[int] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[date] = None
    assignee_id: Optional[int] = None

class TaskResponse(TaskBase):
    id: int
    deal_id: Optional[int] = None
    client_id: Optional[int] = None
    assignee_id: Optional[int] = None
    status: str
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
