from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import datetime, timedelta
from typing import List, Dict

from app.database import get_db
from app.auth import get_current_user
from app.models.user import User
from app.models.client import Client
from app.models.deal import Deal, DealStage
from app.models.task import Task
from app.models.activity import Activity

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Основная статистика для Dashboard"""
    
    # Базовые запросы
    deals_query = db.query(Deal)
    clients_query = db.query(Client)
    tasks_query = db.query(Task)
    
    # Менеджеры видят только свои данные
    if current_user.role == "manager":
        deals_query = deals_query.filter(Deal.manager_id == current_user.id)
        clients_query = clients_query.filter(Client.manager_id == current_user.id)
        tasks_query = tasks_query.filter(Task.assignee_id == current_user.id)
    
    # Сделки
    total_deals = deals_query.count()
    open_deals = deals_query.filter(Deal.status == "open").count()
    won_deals = deals_query.filter(Deal.status == "won").count()
    lost_deals = deals_query.filter(Deal.status == "lost").count()
    
    # Выручка
    total_revenue = db.query(func.sum(Deal.amount)).filter(
        Deal.status == "won"
    )
    if current_user.role == "manager":
        total_revenue = total_revenue.filter(Deal.manager_id == current_user.id)
    total_revenue = total_revenue.scalar() or 0
    
    # Выручка за текущий месяц
    current_month_start = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    month_revenue_query = db.query(func.sum(Deal.amount)).filter(
        Deal.status == "won",
        Deal.closed_at >= current_month_start
    )
    if current_user.role == "manager":
        month_revenue_query = month_revenue_query.filter(Deal.manager_id == current_user.id)
    month_revenue = month_revenue_query.scalar() or 0
    
    # Клиенты
    total_clients = clients_query.count()
    leads_count = clients_query.filter(Client.status == "lead").count()
    clients_count = clients_query.filter(Client.status == "client").count()
    
    # Задачи
    total_tasks = tasks_query.count()
    pending_tasks = tasks_query.filter(Task.status == "pending").count()
    completed_tasks = tasks_query.filter(Task.status == "completed").count()
    
    # Конверсия
    conversion_rate = round((won_deals / total_deals * 100) if total_deals > 0 else 0, 1)
    
    return {
        "deals": {
            "total": total_deals,
            "open": open_deals,
            "won": won_deals,
            "lost": lost_deals,
        },
        "revenue": {
            "total": float(total_revenue),
            "month": float(month_revenue),
        },
        "clients": {
            "total": total_clients,
            "leads": leads_count,
            "clients": clients_count,
        },
        "tasks": {
            "total": total_tasks,
            "pending": pending_tasks,
            "completed": completed_tasks,
        },
        "conversion_rate": conversion_rate,
    }

@router.get("/recent-activities")
def get_recent_activities(
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Последние активности"""
    query = db.query(Activity)
    
    if current_user.role == "manager":
        query = query.filter(Activity.user_id == current_user.id)
    
    activities = query.order_by(Activity.created_at.desc()).limit(limit).all()
    
    return [{
        "id": a.id,
        "type": a.type,
        "subject": a.subject,
        "content": a.content,
        "created_at": a.created_at.isoformat(),
        "user_id": a.user_id,
        "deal_id": a.deal_id,
        "client_id": a.client_id,
    } for a in activities]

@router.get("/sales-chart")
def get_sales_chart(
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Данные для графика продаж"""
    
    start_date = datetime.now() - timedelta(days=days)
    
    query = db.query(
        func.date(Deal.closed_at).label('date'),
        func.count(Deal.id).label('count'),
        func.sum(Deal.amount).label('amount')
    ).filter(
        Deal.status == "won",
        Deal.closed_at >= start_date
    ).group_by(func.date(Deal.closed_at))
    
    if current_user.role == "manager":
        query = query.filter(Deal.manager_id == current_user.id)
    
    results = query.all()
    
    return [{
        "date": r.date.isoformat() if r.date else None,
        "count": r.count,
        "amount": float(r.amount) if r.amount else 0
    } for r in results]

@router.get("/pipeline-stats")
def get_pipeline_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Статистика по стадиям воронки"""
    
    # Получаем все стадии
    stages = db.query(DealStage).order_by(DealStage.sort_order).all()
    
    result = []
    for stage in stages:
        query = db.query(Deal).filter(
            Deal.stage_id == stage.id,
            Deal.status == "open"
        )
        
        if current_user.role == "manager":
            query = query.filter(Deal.manager_id == current_user.id)
        
        deals = query.all()
        count = len(deals)
        amount = sum(deal.amount for deal in deals)
        
        result.append({
            "stage_id": stage.id,
            "stage_name": stage.name,
            "color": stage.color,
            "count": count,
            "amount": float(amount),
        })
    
    return result
