from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.auth import get_current_user
from app.models.user import User
from app.models.deal import Deal, DealStage, Pipeline
from app.models.client import Client
from app.models.activity import Activity
from app.schemas.deal import DealCreate, DealUpdate, DealResponse, DealMove

router = APIRouter(prefix="/api/deals", tags=["deals"])

# ================== CRUD ==================

@router.get("/", response_model=List[DealResponse])
def list_deals(
    pipeline_id: Optional[int] = None,
    stage_id: Optional[int] = None,
    status: Optional[str] = None,
    manager_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Список сделок с фильтрами"""
    query = db.query(Deal)
    
    # Фильтры
    if pipeline_id:
        query = query.filter(Deal.pipeline_id == pipeline_id)
    if stage_id:
        query = query.filter(Deal.stage_id == stage_id)
    if status:
        query = query.filter(Deal.status == status)
    if manager_id:
        query = query.filter(Deal.manager_id == manager_id)
    
    # Менеджеры видят только свои сделки
    if current_user.role == "manager":
        query = query.filter(Deal.manager_id == current_user.id)
    
    deals = query.order_by(Deal.created_at.desc()).offset(skip).limit(limit).all()
    return deals

@router.post("/", response_model=DealResponse)
def create_deal(
    deal: DealCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Создать сделку"""
    # Проверяем что клиент существует
    client = db.query(Client).filter(Client.id == deal.client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    # Проверяем что воронка и стадия существуют
    pipeline = db.query(Pipeline).filter(Pipeline.id == deal.pipeline_id).first()
    if not pipeline:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    
    stage = db.query(DealStage).filter(DealStage.id == deal.stage_id).first()
    if not stage:
        raise HTTPException(status_code=404, detail="Stage not found")
    
    # Если manager_id не указан, назначаем текущего
    if not deal.manager_id:
        deal.manager_id = current_user.id
    
    db_deal = Deal(**deal.dict())
    db.add(db_deal)
    db.commit()
    db.refresh(db_deal)
    
    # Создаем активность
    activity = Activity(
        type="note",
        deal_id=db_deal.id,
        client_id=deal.client_id,
        user_id=current_user.id,
        subject="Сделка создана",
        content=f"Создана новая сделка: {db_deal.title}"
    )
    db.add(activity)
    db.commit()
    
    return db_deal

@router.get("/{deal_id}", response_model=DealResponse)
def get_deal(
    deal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    
    # Менеджеры видят только свои сделки
    if current_user.role == "manager" and deal.manager_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return deal

@router.put("/{deal_id}", response_model=DealResponse)
def update_deal(
    deal_id: int,
    deal_update: DealUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Обновить сделку"""
    db_deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not db_deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    
    # Менеджеры могут редактировать только свои сделки
    if current_user.role == "manager" and db_deal.manager_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    for key, value in deal_update.dict(exclude_unset=True).items():
        setattr(db_deal, key, value)
    
    db.commit()
    db.refresh(db_deal)
    return db_deal

@router.delete("/{deal_id}")
def delete_deal(
    deal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Удалить сделку (только админ/менеджер сделки)"""
    db_deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not db_deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    
    if current_user.role != "admin" and db_deal.manager_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    db.delete(db_deal)
    db.commit()
    return {"message": "Deal deleted"}

# ================== KANBAN ==================

@router.post("/{deal_id}/move", response_model=DealResponse)
def move_deal(
    deal_id: int,
    move: DealMove,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Переместить сделку в другую стадию (Kanban drag&drop)"""
    db_deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not db_deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    
    # Менеджеры могут перемещать только свои сделки
    if current_user.role == "manager" and db_deal.manager_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Проверяем новую стадию
    new_stage = db.query(DealStage).filter(DealStage.id == move.stage_id).first()
    if not new_stage:
        raise HTTPException(status_code=404, detail="Stage not found")
    
    old_stage = db.query(DealStage).filter(DealStage.id == db_deal.stage_id).first()
    
    # Обновляем стадию
    db_deal.stage_id = move.stage_id
    
    # Если это конечная стадия - закрываем сделку
    if new_stage.is_final:
        db_deal.closed_at = datetime.utcnow()
        if new_stage.is_won:
            db_deal.status = "won"
        else:
            db_deal.status = "lost"
            if move.reason:
                db_deal.lost_reason = move.reason
    
    db.commit()
    
    # Создаем активность
    activity = Activity(
        type="note",
        deal_id=db_deal.id,
        client_id=db_deal.client_id,
        user_id=current_user.id,
        subject="Сделка перемещена",
        content=f"Стадия изменена: {old_stage.name} → {new_stage.name}"
    )
    db.add(activity)
    db.commit()
    
    db.refresh(db_deal)
    return db_deal

# ================== СТАТИСТИКА ==================

@router.get("/stats/pipeline")
def get_pipeline_stats(
    pipeline_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Статистика по воронке (для Kanban)"""
    # Получаем все стадии
    stages = db.query(DealStage).filter(DealStage.pipeline_id == pipeline_id).order_by(DealStage.sort_order).all()
    
    result = []
    for stage in stages:
        # Количество сделок в стадии
        query = db.query(Deal).filter(
            Deal.pipeline_id == pipeline_id,
            Deal.stage_id == stage.id,
            Deal.status == "open"
        )
        
        # Менеджеры видят только свои
        if current_user.role == "manager":
            query = query.filter(Deal.manager_id == current_user.id)
        
        deals = query.all()
        deals_count = len(deals)
        total_amount = sum(deal.amount for deal in deals)
        
        result.append({
            "stage_id": stage.id,
            "stage_name": stage.name,
            "color": stage.color,
            "deals_count": deals_count,
            "total_amount": total_amount,
            "deals": [{
                "id": deal.id,
                "title": deal.title,
                "amount": deal.amount,
                "client_id": deal.client_id,
            } for deal in deals]
        })
    
    return result
