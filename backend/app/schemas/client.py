from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ClientBase(BaseModel):
    name: str
    inn: Optional[str] = None
    website: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    source: Optional[str] = None
    notes: Optional[str] = None

class ClientCreate(ClientBase):
    manager_id: Optional[int] = None

class ClientUpdate(BaseModel):
    name: Optional[str] = None
    inn: Optional[str] = None
    website: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    source: Optional[str] = None
    status: Optional[str] = None
    manager_id: Optional[int] = None
    notes: Optional[str] = None

class ClientResponse(ClientBase):
    id: int
    status: str
    manager_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    last_contact: datetime
    
    class Config:
        from_attributes = True
