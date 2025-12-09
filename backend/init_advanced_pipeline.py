#!/usr/bin/env python3
"""
Скрипт для создания продвинутых воронок с оптом/розницей
"""
import sys
from app.database import SessionLocal
from app.models.deal import Pipeline, DealStage

def create_advanced_pipelines():
    db = SessionLocal()
    
    print("\n=== noctoCRM - Создание воронок ОПТ/РОЗНИЦА ===")
    
    # 1. Воронка ОПТ
    pipeline_opt = Pipeline(
        name="Оптовые продажи",
        description="Воронка для оптовых клиентов",
        sort_order=0,
        is_active=True
    )
    db.add(pipeline_opt)
    db.commit()
    db.refresh(pipeline_opt)
    
    print(f"\n✅ Воронка создана: {pipeline_opt.name}")
    
    stages_opt = [
        {
            "name": "Новый лид",
            "description": "Первичное обращение",
            "color": "#94A3B8",
            "sort_order": 0,
            "win_probability": 5
        },
        {
            "name": "Опт - квал",
            "description": "Клиент соответствует портрету оптового покупателя",
            "color": "#3B82F6",
            "sort_order": 1,
            "win_probability": 20
        },
        {
            "name": "Опт - квал (в работе)",
            "description": "Контакт установлен, отправлено КП",
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
            "name": "Успешно",
            "description": "Сделка закрыта",
            "color": "#059669",
            "sort_order": 4,
            "win_probability": 100,
            "is_final": True,
            "is_won": True
        },
        {
            "name": "Отказ - дорого",
            "description": "Нет бюджета",
            "color": "#DC2626",
            "sort_order": 5,
            "win_probability": 0,
            "is_final": True,
            "is_won": False
        },
        {
            "name": "Отказ - конкурент",
            "description": "Выбрал другую компанию",
            "color": "#DC2626",
            "sort_order": 6,
            "win_probability": 0,
            "is_final": True,
            "is_won": False
        },
        {
            "name": "Отказ - не актуально",
            "description": "Потребность отпала",
            "color": "#DC2626",
            "sort_order": 7,
            "win_probability": 0,
            "is_final": True,
            "is_won": False
        },
        {
            "name": "Неквал - не ЦА",
            "description": "Не подходит под целевую аудиторию",
            "color": "#6B7280",
            "sort_order": 8,
            "win_probability": 0,
            "is_final": True,
            "is_won": False
        },
    ]
    
    print("\nСтадии ОПТ:")
    for stage_data in stages_opt:
        stage = DealStage(pipeline_id=pipeline_opt.id, **stage_data)
        db.add(stage)
        db.commit()
        db.refresh(stage)
        print(f"  ✅ {stage.name}")
    
    # 2. Воронка РОЗНИЦА
    pipeline_retail = Pipeline(
        name="Розничные продажи",
        description="Воронка для розничных клиентов",
        sort_order=1,
        is_active=True
    )
    db.add(pipeline_retail)
    db.commit()
    db.refresh(pipeline_retail)
    
    print(f"\n✅ Воронка создана: {pipeline_retail.name}")
    
    stages_retail = [
        {
            "name": "Новый лид",
            "description": "Первичное обращение",
            "color": "#94A3B8",
            "sort_order": 0,
            "win_probability": 5
        },
        {
            "name": "Розница - квал",
            "description": "Клиент подходит под розничный сегмент",
            "color": "#3B82F6",
            "sort_order": 1,
            "win_probability": 30
        },
        {
            "name": "Розница - квал (в работе)",
            "description": "Менеджер связался, подбирает товар",
            "color": "#8B5CF6",
            "sort_order": 2,
            "win_probability": 60
        },
        {
            "name": "Готов к покупке",
            "description": "Согласовываются детали",
            "color": "#F59E0B",
            "sort_order": 3,
            "win_probability": 80
        },
        {
            "name": "Успешно",
            "description": "Покупка совершена",
            "color": "#059669",
            "sort_order": 4,
            "win_probability": 100,
            "is_final": True,
            "is_won": True
        },
        {
            "name": "Отказ - дорого",
            "description": "Нет бюджета",
            "color": "#DC2626",
            "sort_order": 5,
            "win_probability": 0,
            "is_final": True,
            "is_won": False
        },
        {
            "name": "Отказ - нет товара",
            "description": "Нет нужной позиции",
            "color": "#DC2626",
            "sort_order": 6,
            "win_probability": 0,
            "is_final": True,
            "is_won": False
        },
        {
            "name": "Неквал - нет контакта",
            "description": "Клиент не выходит на связь",
            "color": "#6B7280",
            "sort_order": 7,
            "win_probability": 0,
            "is_final": True,
            "is_won": False
        },
    ]
    
    print("\nСтадии РОЗНИЦА:")
    for stage_data in stages_retail:
        stage = DealStage(pipeline_id=pipeline_retail.id, **stage_data)
        db.add(stage)
        db.commit()
        db.refresh(stage)
        print(f"  ✅ {stage.name}")
    
    print("\n✅ SUCCESS: Воронки готовы!")
    print("\nТеперь у вас:")
    print("  - Воронка для Опта")
    print("  - Воронка для Розницы")
    
    db.close()

if __name__ == "__main__":
    try:
        create_advanced_pipelines()
    except KeyboardInterrupt:
        print("\n\nCancelled")
        sys.exit(0)
    except Exception as e:
        print(f"\nERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
