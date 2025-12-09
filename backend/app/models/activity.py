from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Activity(Base):
    """История взаимодействий (звонки, письма, встречи)"""
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    
    # Тип: call, email, meeting, note, whatsapp, telegram
    type = Column(String, nullable=False, index=True)
    
    # Связи
    deal_id = Column(Integer, ForeignKey("deals.id"), nullable=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Содержимое
    subject = Column(String, nullable=True)  # Тема
    content = Column(Text, nullable=True)  # Текст
    
    # Длительность (для звонков/встреч в секундах)
    duration = Column(Integer, nullable=True)
    
    # Дата действия
    activity_date = Column(DateTime, default=datetime.utcnow, index=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    deal = relationship("Deal", back_populates="activities")
