# Архитектура noctoCRM

## 🛠️ Технологический стек

### Backend
- **FastAPI** - современный Python фреймворк
- **SQLAlchemy** - ORM для работы с БД
- **PostgreSQL** - основная база данных
- **Pydantic** - валидация данных
- **JWT** - аутентификация

### Frontend
- **Next.js 14** - React фреймворк
- **TypeScript** - типизация
- **Чистый CSS** - без Tailwind!
- **Axios** - HTTP клиент

---

## 📁 Структура проекта

```
noctoCRM/
├── backend/
│   ├── app/
│   │   ├── models/          # Модели SQLAlchemy
│   │   │   ├── user.py       # User (пользователи)
│   │   │   ├── client.py     # Client (клиенты)
│   │   │   ├── deal.py       # Deal, DealStage, Pipeline
│   │   │   ├── task.py       # Task (задачи)
│   │   │   └── activity.py   # Activity (история)
│   │   │
│   │   ├── routers/         # API эндпоинты
│   │   │   ├── auth.py       # POST /api/auth/login
│   │   │   ├── clients.py    # CRUD /api/clients
│   │   │   ├── deals.py      # CRUD /api/deals
│   │   │   ├── pipelines.py  # GET /api/pipelines
│   │   │   └── dashboard.py  # GET /api/dashboard/stats
│   │   │
│   │   ├── schemas/         # Pydantic схемы
│   │   │   ├── user.py
│   │   │   ├── client.py
│   │   │   └── deal.py
│   │   │
│   │   ├── auth.py          # JWT аутентификация
│   │   ├── config.py        # Конфигурация
│   │   ├── database.py      # Подключение к БД
│   │   └── main.py          # FastAPI app
│   │
│   ├── create_admin.py      # Скрипт создания админа
│   ├── init_pipeline.py     # Создание воронок
│   └── create_test_data.py  # Тестовые данные
│
└── frontend/
    ├── src/
    │   ├── app/             # Next.js страницы
    │   │   ├── dashboard/   # Dashboard
    │   │   ├── kanban/      # Kanban доска
    │   │   ├── clients/     # Клиенты
    │   │   ├── deals/       # Сделки
    │   │   └── login/       # Авторизация
    │   │
    │   ├── components/      # React компоненты
    │   │   └── Sidebar.tsx  # Боковое меню
    │   │
    │   ├── lib/
    │   │   └── api.ts       # Axios клиент + типы
    │   │
    │   └── globals.css      # Чистый CSS (БЕЗ TAILWIND!)
    │
    └── package.json
```

---

## 📊 База данных

### Основные таблицы:

**users** - пользователи (admin/manager)
- id, username, email, role, password_hash

**clients** - клиенты
- id, name, inn, email, phone, status, manager_id
- **subscription_start** - дата начала подписки
- **subscription_end** - дата окончания
- **monthly_payment** - ежемесячный платёж

**pipelines** - воронки продаж
- id, name, description, is_active

**deal_stages** - стадии воронки
- id, pipeline_id, name, color, sort_order, win_probability

**deals** - сделки
- id, title, client_id, pipeline_id, stage_id, amount, status, manager_id

**tasks** - задачи
- id, title, deal_id, assignee_id, due_date, status

**activities** - история действий
- id, user_id, type, subject, content, deal_id, client_id

---

## 🔐 Аутентификация

1. Пользователь логинится: `POST /api/auth/login`
2. Получает JWT токен
3. Токен сохраняется в `localStorage`
4. Каждый запрос: `Authorization: Bearer <token>`

---

## 🎨 CSS Архитектура

### Почему БЕЗ Tailwind?

✅ **Проще читать** - обычные CSS классы  
✅ **Проще поддерживать** - всё в одном файле  
✅ **Меньше зависимостей** - не нужно учить Tailwind  
✅ **CSS Variables** - легко менять цвета  

### Структура globals.css:

```css
:root {              /* CSS переменные */
  --accent: #0D6EFD;
  --success: #198754;
  ...
}

/* Utility classes */
.flex { ... }
.gap-4 { ... }

/* Components */
.btn { ... }
.card { ... }
.input { ... }
```

---

## 🛣️ API Routes

### Auth
- `POST /api/auth/login` - вход
- `GET /api/auth/me` - текущий юзер

### Clients
- `GET /api/clients` - список
- `POST /api/clients` - создать
- `PUT /api/clients/{id}` - обновить
- `DELETE /api/clients/{id}` - удалить
- `GET /api/clients/stats/summary` - статистика

### Deals
- `GET /api/deals` - список
- `POST /api/deals` - создать
- `PUT /api/deals/{id}` - обновить
- `POST /api/deals/{id}/move` - переместить
- `GET /api/deals/stats/pipeline` - Kanban статистика

### Pipelines
- `GET /api/pipelines` - список воронок
- `GET /api/pipelines/{id}/stages` - стадии

### Dashboard
- `GET /api/dashboard/stats` - общая статистика
- `GET /api/dashboard/recent-activities` - последние активности
- `GET /api/dashboard/pipeline-stats` - статистика воронки

---

## 💰 Подписка клиентов

Клиенты платят **ежемесячно**.

### Поля в Client:
- `subscription_start` (date) - начало подписки
- `subscription_end` (date) - конец (или NULL если активна)
- `monthly_payment` (decimal) - ежемесячный платёж

### Расчёт выручки:
```sql
SELECT SUM(monthly_payment) 
FROM clients 
WHERE subscription_start <= NOW() 
  AND (subscription_end IS NULL OR subscription_end >= NOW())
```

---

## 👥 Роли пользователей

### Admin
- Видит всех клиентов и сделки
- Может удалять всё
- Доступ к полной статистике

### Manager
- Видит только своих клиентов
- Редактирует только свои сделки
- Статистика только по своим данным

---

## 🚀 Что дальше?

### В разработке:
- Карточка сделки
- Управление задачами
- Аналитика и графики
- Email/Telegram уведомления
- Экспорт в Excel
