from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.auth import get_current_user
from app.models.user import User
from app.models.deal import Pipeline, DealStage
from app.schemas.deal import (
    PipelineCreate, PipelineUpdate, PipelineResponse,
    DealStageCreate, DealStageUpdate, DealStageResponse
)

router = APIRouter(prefix="/api/pipelines", tags=["pipelines"])

# ================== PIPELINES ==================

@router.get("/", response_model=List[PipelineResponse])
def list_pipelines(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Список всех воронок"""
    pipelines = db.query(Pipeline).filter(Pipeline.is_active == True).order_by(Pipeline.sort_order).offset(skip).limit(limit).all()
    return pipelines

@router.post("/", response_model=PipelineResponse)
def create_pipeline(
    pipeline: PipelineCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Создать воронку (только админ)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    db_pipeline = Pipeline(**pipeline.dict())
    db.add(db_pipeline)
    db.commit()
    db.refresh(db_pipeline)
    return db_pipeline

@router.get("/{pipeline_id}", response_model=PipelineResponse)
def get_pipeline(
    pipeline_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    pipeline = db.query(Pipeline).filter(Pipeline.id == pipeline_id).first()
    if not pipeline:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    return pipeline

@router.put("/{pipeline_id}", response_model=PipelineResponse)
def update_pipeline(
    pipeline_id: int,
    pipeline_update: PipelineUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Обновить воронку (только админ)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    db_pipeline = db.query(Pipeline).filter(Pipeline.id == pipeline_id).first()
    if not db_pipeline:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    
    for key, value in pipeline_update.dict(exclude_unset=True).items():
        setattr(db_pipeline, key, value)
    
    db.commit()
    db.refresh(db_pipeline)
    return db_pipeline

# ================== STAGES ==================

@router.get("/{pipeline_id}/stages", response_model=List[DealStageResponse])
def list_stages(
    pipeline_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Список стадий воронки"""
    stages = db.query(DealStage).filter(DealStage.pipeline_id == pipeline_id).order_by(DealStage.sort_order).all()
    return stages

@router.post("/{pipeline_id}/stages", response_model=DealStageResponse)
def create_stage(
    pipeline_id: int,
    stage: DealStageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Создать стадию (только админ)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Проверяем что воронка существует
    pipeline = db.query(Pipeline).filter(Pipeline.id == pipeline_id).first()
    if not pipeline:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    
    db_stage = DealStage(**stage.dict())
    db.add(db_stage)
    db.commit()
    db.refresh(db_stage)
    return db_stage

@router.put("/stages/{stage_id}", response_model=DealStageResponse)
def update_stage(
    stage_id: int,
    stage_update: DealStageUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Обновить стадию (только админ)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    db_stage = db.query(DealStage).filter(DealStage.id == stage_id).first()
    if not db_stage:
        raise HTTPException(status_code=404, detail="Stage not found")
    
    for key, value in stage_update.dict(exclude_unset=True).items():
        setattr(db_stage, key, value)
    
    db.commit()
    db.refresh(db_stage)
    return db_stage

@router.delete("/stages/{stage_id}")
def delete_stage(
    stage_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Удалить стадию (только админ)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    db_stage = db.query(DealStage).filter(DealStage.id == stage_id).first()
    if not db_stage:
        raise HTTPException(status_code=404, detail="Stage not found")
    
    # Проверяем что нет сделок в этой стадии
    from app.models.deal import Deal
    deals_count = db.query(Deal).filter(Deal.stage_id == stage_id).count()
    if deals_count > 0:
        raise HTTPException(status_code=400, detail=f"Cannot delete stage with {deals_count} deals")
    
    db.delete(db_stage)
    db.commit()
    return {"message": "Stage deleted"}
