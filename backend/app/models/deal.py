from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Pipeline(Base):
    """Воронка продаж (например: 'Основная', 'Повторные продажи')"""
    __tablename__ = "pipelines"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    
    # Порядок сортировки
    sort_order = Column(Integer, default=0)
    
    # Активна?
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    stages = relationship("DealStage", back_populates="pipeline", cascade="all, delete-orphan")
    deals = relationship("Deal", back_populates="pipeline")

class DealStage(Base):
    """Стадия сделки (например: 'Новый лид', 'Квалификация', 'Переговоры')"""
    __tablename__ = "deal_stages"

    id = Column(Integer, primary_key=True, index=True)
    pipeline_id = Column(Integer, ForeignKey("pipelines.id"), nullable=False)
    
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    color = Column(String, default="#3B82F6")  # Hex цвет
    
    # Порядок в воронке
    sort_order = Column(Integer, default=0)
    
    # Вероятность закрытия (0-100%)
    win_probability = Column(Integer, default=0)
    
    # Это конечная стадия?
    is_final = Column(Boolean, default=False)  # True для "Сделка закрыта" или "Провал"
    is_won = Column(Boolean, default=False)  # True для успешного закрытия
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    pipeline = relationship("Pipeline", back_populates="stages")
    deals = relationship("Deal", back_populates="stage")

class Deal(Base):
    """Сделка - основная сущность CRM"""
    __tablename__ = "deals"

    id = Column(Integer, primary_key=True, index=True)
    
    # Основная информация
    title = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    
    # Связи
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False, index=True)
    pipeline_id = Column(Integer, ForeignKey("pipelines.id"), nullable=False)
    stage_id = Column(Integer, ForeignKey("deal_stages.id"), nullable=False, index=True)
    manager_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Финансы
    amount = Column(Float, default=0)  # Сумма сделки
    currency = Column(String, default="RUB")
    
    # Даты
    expected_close_date = Column(DateTime, nullable=True)  # Ожидаемая дата закрытия
    closed_at = Column(DateTime, nullable=True)  # Фактическая дата
    
    # Статус: open (открыта), won (выиграна), lost (проиграна)
    status = Column(String, default="open", index=True)
    
    # Причина проигрыша (если lost)
    lost_reason = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    client = relationship("Client", back_populates="deals")
    pipeline = relationship("Pipeline", back_populates="deals")
    stage = relationship("DealStage", back_populates="deals")
    tasks = relationship("Task", back_populates="deal", cascade="all, delete-orphan")
    activities = relationship("Activity", back_populates="deal", cascade="all, delete-orphan")
