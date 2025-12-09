#!/usr/bin/env python3
"""
Скрипт для создания стандартной воронки продаж
Запускать после создания админа
"""
import sys
from app.database import SessionLocal
from app.models.deal import Pipeline, DealStage

def create_default_pipeline():
    db = SessionLocal()
    
    print("\n=== noctoCRM - Создание стандартной воронки ===")
    
    # Проверяем есть ли уже воронки
    existing = db.query(Pipeline).first()
    if existing:
        print(f"\nWARNING: Воронка уже существует: {existing.name}")
        response = input("Создать еще одну? (y/n): ")
        if response.lower() != 'y':
            print("Cancelled")
            db.close()
            return
    
    # Создаем воронку
    pipeline = Pipeline(
        name="Основная воронка",
        description="Стандартная воронка продаж для рекламного агентства",
        sort_order=0,
        is_active=True
    )
    db.add(pipeline)
    db.commit()
    db.refresh(pipeline)
    
    print(f"\n✅ Воронка создана: {pipeline.name} (ID: {pipeline.id})")
    
    # Создаем стадии
    stages = [
        {
            "name": "Новый лид",
            "description": "Первичный контакт",
            "color": "#94A3B8",
            "sort_order": 0,
            "win_probability": 10
        },
        {
            "name": "Квалификация",
            "description": "Выяснение потребностей",
            "color": "#3B82F6",
            "sort_order": 1,
            "win_probability": 25
        },
        {
            "name": "Коммерческое предложение",
            "description": "Отправлено КП",
            "color": "#8B5CF6",
            "sort_order": 2,
            "win_probability": 50
        },
        {
            "name": "Переговоры",
            "description": "Обсуждение условий",
            "color": "#F59E0B",
            "sort_order": 3,
            "win_probability": 75
        },
        {
            "name": "Договор",
            "description": "Подготовка и подписание",
            "color": "#10B981",
            "sort_order": 4,
            "win_probability": 90
        },
        {
            "name": "Успешно закрыто",
            "description": "Сделка выиграна",
            "color": "#059669",
            "sort_order": 5,
            "win_probability": 100,
            "is_final": True,
            "is_won": True
        },
        {
            "name": "Проиграно",
            "description": "Сделка провалена",
            "color": "#EF4444",
            "sort_order": 6,
            "win_probability": 0,
            "is_final": True,
            "is_won": False
        }
    ]
    
    print("\nСтадии:")
    for stage_data in stages:
        stage = DealStage(
            pipeline_id=pipeline.id,
            **stage_data
        )
        db.add(stage)
        db.commit()
        db.refresh(stage)
        print(f"  ✅ {stage.name} (ID: {stage.id})")
    
    print("\n✅ SUCCESS: Воронка продаж готова!")
    print("\nТеперь можно:")
    print("1. Запустить сервер: uvicorn app.main:app --reload")
    print("2. Открыть API docs: http://127.0.0.1:8000/docs")
    print("3. Создавать сделки через API")
    
    db.close()

if __name__ == "__main__":
    try:
        create_default_pipeline()
    except KeyboardInterrupt:
        print("\n\nCancelled")
        sys.exit(0)
    except Exception as e:
        print(f"\nERROR: {e}")
        sys.exit(1)
