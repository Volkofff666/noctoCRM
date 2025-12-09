from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.auth import get_current_user
from app.models.user import User
from app.models.client import Client
from app.schemas.client import ClientCreate, ClientUpdate, ClientResponse

router = APIRouter(prefix="/api/clients", tags=["clients"])

@router.get("/", response_model=List[ClientResponse])
def list_clients(
    status: Optional[str] = None,
    search: Optional[str] = None,
    manager_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Список клиентов с фильтрами"""
    query = db.query(Client)
    
    # Фильтры
    if status:
        query = query.filter(Client.status == status)
    
    if manager_id:
        query = query.filter(Client.manager_id == manager_id)
    
    # Поиск по названию, email, ИНН
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (Client.name.ilike(search_filter)) |
            (Client.email.ilike(search_filter)) |
            (Client.inn.ilike(search_filter))
        )
    
    # Менеджеры видят только своих клиентов
    if current_user.role == "manager":
        query = query.filter(Client.manager_id == current_user.id)
    
    clients = query.order_by(Client.created_at.desc()).offset(skip).limit(limit).all()
    return clients

@router.post("/", response_model=ClientResponse)
def create_client(
    client: ClientCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Создать клиента"""
    # Если manager_id не указан, назначаем текущего
    if not client.manager_id:
        client.manager_id = current_user.id
    
    db_client = Client(**client.dict())
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    return db_client

@router.get("/{client_id}", response_model=ClientResponse)
def get_client(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Получить клиента"""
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    # Менеджеры видят только своих
    if current_user.role == "manager" and client.manager_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return client

@router.put("/{client_id}", response_model=ClientResponse)
def update_client(
    client_id: int,
    client_update: ClientUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Обновить клиента"""
    db_client = db.query(Client).filter(Client.id == client_id).first()
    if not db_client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    # Менеджеры могут редактировать только своих
    if current_user.role == "manager" and db_client.manager_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    for key, value in client_update.dict(exclude_unset=True).items():
        setattr(db_client, key, value)
    
    db.commit()
    db.refresh(db_client)
    return db_client

@router.delete("/{client_id}")
def delete_client(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Удалить клиента"""
    db_client = db.query(Client).filter(Client.id == client_id).first()
    if not db_client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    # Только админ или ответственный менеджер
    if current_user.role != "admin" and db_client.manager_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    db.delete(db_client)
    db.commit()
    return {"message": "Client deleted"}

@router.get("/stats/summary")
def get_clients_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Статистика по клиентам"""
    query = db.query(Client)
    
    # Менеджеры видят только своих
    if current_user.role == "manager":
        query = query.filter(Client.manager_id == current_user.id)
    
    total = query.count()
    leads = query.filter(Client.status == "lead").count()
    clients = query.filter(Client.status == "client").count()
    archived = query.filter(Client.status == "archive").count()
    
    return {
        "total": total,
        "leads": leads,
        "clients": clients,
        "archived": archived,
    }
