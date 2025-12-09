#!/usr/bin/env python3
"""
Скрипт для создания тестовых данных для демо
"""
import sys
from app.database import SessionLocal
from app.models.client import Client
from app.models.deal import Deal, DealStage
from app.models.user import User

def create_test_data():
    db = SessionLocal()
    
    print("\n=== Создание тестовых данных ===")
    
    # Проверяем есть ли пользователь
    user = db.query(User).first()
    if not user:
        print("⚠️  Сначала создайте пользователя: python create_admin.py")
        return
    
    # Проверяем есть ли стадии
    stages = db.query(DealStage).all()
    if not stages:
        print("⚠️  Сначала создайте воронку: python init_pipeline.py")
        return
    
    # Тестовые клиенты
    test_clients = [
        {
            "name": "IT-компания \"Tehno Plus\"",
            "inn": "7701234567",
            "email": "info@tehnoplus.ru",
            "phone": "+7 (495) 123-45-67",
            "status": "lead",
            "source": "Яндекс Директ",
            "manager_id": user.id
        },
        {
            "name": "Медицинский центр \"3доровье\"",
            "inn": "7702345678",
            "email": "contact@zdorovie.ru",
            "phone": "+7 (495) 234-56-78",
            "status": "client",
            "source": "Google Ads",
            "manager_id": user.id
        },
        {
            "name": "Ресторан \"Vkusno\"",
            "inn": "7703456789",
            "email": "resto@vkusno.ru",
            "phone": "+7 (495) 345-67-89",
            "status": "lead",
            "source": "Рекомендация",
            "manager_id": user.id
        },
        {
            "name": "Автосалон \"Drive\"",
            "inn": "7704567890",
            "email": "sales@drive-auto.ru",
            "phone": "+7 (495) 456-78-90",
            "status": "client",
            "source": "Яндекс Директ",
            "manager_id": user.id
        },
        {
            "name": "Строительная компания \"Stroy Dom\"",
            "inn": "7705678901",
            "email": "info@stroydom.ru",
            "phone": "+7 (495) 567-89-01",
            "status": "lead",
            "source": "Холодный звонок",
            "manager_id": user.id
        },
    ]
    
    print("\nСоздаём клиентов:")
    clients = []
    for client_data in test_clients:
        client = Client(**client_data)
        db.add(client)
        db.commit()
        db.refresh(client)
        clients.append(client)
        print(f"  ✅ {client.name}")
    
    # Тестовые сделки
    pipeline_id = stages[0].pipeline_id
    
    test_deals = [
        {
            "title": "Контекстная реклама для IT",
            "client_id": clients[0].id,
            "pipeline_id": pipeline_id,
            "stage_id": stages[0].id,
            "amount": 50000,
            "currency": "RUB",
            "manager_id": user.id,
            "status": "open"
        },
        {
            "title": "SMM для медцентра",
            "client_id": clients[1].id,
            "pipeline_id": pipeline_id,
            "stage_id": stages[1].id if len(stages) > 1 else stages[0].id,
            "amount": 75000,
            "currency": "RUB",
            "manager_id": user.id,
            "status": "open"
        },
        {
            "title": "Сайт для ресторана",
            "client_id": clients[2].id,
            "pipeline_id": pipeline_id,
            "stage_id": stages[2].id if len(stages) > 2 else stages[0].id,
            "amount": 120000,
            "currency": "RUB",
            "manager_id": user.id,
            "status": "open"
        },
        {
            "title": "SEO продвижение автосалона",
            "client_id": clients[3].id,
            "pipeline_id": pipeline_id,
            "stage_id": stages[3].id if len(stages) > 3 else stages[0].id,
            "amount": 90000,
            "currency": "RUB",
            "manager_id": user.id,
            "status": "open"
        },
        {
            "title": "Реклама строительной компании",
            "client_id": clients[4].id,
            "pipeline_id": pipeline_id,
            "stage_id": stages[0].id,
            "amount": 150000,
            "currency": "RUB",
            "manager_id": user.id,
            "status": "open"
        },
    ]
    
    print("\nСоздаём сделки:")
    for deal_data in test_deals:
        deal = Deal(**deal_data)
        db.add(deal)
        db.commit()
        db.refresh(deal)
        print(f"  ✅ {deal.title} - {deal.amount} ₽")
    
    print("\n✅ Тестовые данные созданы!")
    print(f"\nСоздано:")
    print(f"  - {len(clients)} клиентов")
    print(f"  - {len(test_deals)} сделок")
    print(f"\nТеперь можно открыть CRM и увидеть данные!")
    
    db.close()

if __name__ == "__main__":
    try:
        create_test_data()
    except KeyboardInterrupt:
        print("\n\nCancelled")
        sys.exit(0)
    except Exception as e:
        print(f"\nERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
