from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

# Pipeline Schemas
class PipelineBase(BaseModel):
    name: str
    description: Optional[str] = None

class PipelineCreate(PipelineBase):
    pass

class PipelineUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class PipelineResponse(PipelineBase):
    id: int
    sort_order: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Deal Stage Schemas
class DealStageBase(BaseModel):
    name: str
    description: Optional[str] = None
    color: str = "#3B82F6"
    win_probability: int = 0

class DealStageCreate(DealStageBase):
    pipeline_id: int
    sort_order: int = 0
    is_final: bool = False
    is_won: bool = False

class DealStageUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = None
    sort_order: Optional[int] = None
    win_probability: Optional[int] = None
    is_final: Optional[bool] = None
    is_won: Optional[bool] = None

class DealStageResponse(DealStageBase):
    id: int
    pipeline_id: int
    sort_order: int
    win_probability: int
    is_final: bool
    is_won: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Deal Schemas
class DealBase(BaseModel):
    title: str
    description: Optional[str] = None
    amount: float = 0
    currency: str = "RUB"

class DealCreate(DealBase):
    client_id: int
    pipeline_id: int
    stage_id: int
    manager_id: Optional[int] = None
    expected_close_date: Optional[datetime] = None

class DealUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    amount: Optional[float] = None
    currency: Optional[str] = None
    stage_id: Optional[int] = None
    manager_id: Optional[int] = None
    expected_close_date: Optional[datetime] = None
    status: Optional[str] = None
    lost_reason: Optional[str] = None

class DealMove(BaseModel):
    """Перемещение сделки между стадиями"""
    stage_id: int
    reason: Optional[str] = None  # Причина перемещения/закрытия

class DealResponse(DealBase):
    id: int
    client_id: int
    pipeline_id: int
    stage_id: int
    manager_id: Optional[int] = None
    status: str
    expected_close_date: Optional[datetime] = None
    closed_at: Optional[datetime] = None
    lost_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
