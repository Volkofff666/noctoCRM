from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List

class ContactBase(BaseModel):
    name: str
    position: Optional[str] = None
    phone: str
    email: Optional[EmailStr] = None
    telegram: Optional[str] = None
    whatsapp: Optional[str] = None
    notes: Optional[str] = None
    is_primary: bool = False

class ContactCreate(ContactBase):
    pass

class ContactResponse(ContactBase):
    id: int
    client_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class ClientBase(BaseModel):
    name: str
    inn: Optional[str] = None
    website: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    source: Optional[str] = None
    status: str = "lead"
    notes: Optional[str] = None

class ClientCreate(ClientBase):
    manager_id: Optional[int] = None

class ClientUpdate(BaseModel):
    name: Optional[str] = None
    inn: Optional[str] = None
    website: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    source: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    manager_id: Optional[int] = None

class ClientResponse(ClientBase):
    id: int
    manager_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    last_contact: datetime
    contacts: List[ContactResponse] = []
    
    class Config:
        from_attributes = True
