from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Date, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Task(Base):
    """Задача"""
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    
    # Основная информация
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    
    # Связи (можно привязать к сделке или клиенту)
    deal_id = Column(Integer, ForeignKey("deals.id"), nullable=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=True, index=True)
    
    # Ответственный
    assignee_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Статус: todo, in_progress, done, cancelled
    status = Column(String, default="todo", index=True)
    
    # Приоритет: low, medium, high, critical
    priority = Column(String, default="medium")
    
    # Даты
    due_date = Column(Date, nullable=True, index=True)
    completed_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    deal = relationship("Deal", back_populates="tasks")
