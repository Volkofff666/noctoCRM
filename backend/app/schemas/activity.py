from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ActivityBase(BaseModel):
    type: str
    subject: Optional[str] = None
    content: Optional[str] = None
    duration: Optional[int] = None

class ActivityCreate(ActivityBase):
    deal_id: Optional[int] = None
    client_id: Optional[int] = None

class ActivityResponse(ActivityBase):
    id: int
    deal_id: Optional[int] = None
    client_id: Optional[int] = None
    user_id: int
    activity_date: datetime
    created_at: datetime
    
    class Config:
        from_attributes = True
