from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Client(Base):
    """Модель клиента (компании)"""
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)
    
    # Основная информация
    name = Column(String, nullable=False, index=True)  # Название компании
    inn = Column(String, nullable=True, index=True)  # ИНН
    website = Column(String, nullable=True)
    
    # Контактная информация
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    address = Column(String, nullable=True)
    
    # Источник
    source = Column(String, nullable=True)  # реклама, соцсети, рекомендация
    
    # Статус: lead (лид), client (клиент), archive (архив)
    status = Column(String, default="lead", index=True)
    
    # Ответственный менеджер
    manager_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Заметки
    notes = Column(Text, nullable=True)
    
    # Даты
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_contact = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    contacts = relationship("Contact", back_populates="client", cascade="all, delete-orphan")
    deals = relationship("Deal", back_populates="client", cascade="all, delete-orphan")

class Contact(Base):
    """Модель контактного лица"""
    __tablename__ = "contacts"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    
    # Персональная информация
    name = Column(String, nullable=False)
    position = Column(String, nullable=True)  # Должность
    
    # Контакты
    phone = Column(String, nullable=False)
    email = Column(String, nullable=True)
    telegram = Column(String, nullable=True)
    whatsapp = Column(String, nullable=True)
    
    # Заметки
    notes = Column(Text, nullable=True)
    
    # Основной контакт?
    is_primary = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    client = relationship("Client", back_populates="contacts")
