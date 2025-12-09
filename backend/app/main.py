from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.config import settings

# Импортируем модели для создания таблиц
from app.models import User, Client, Contact, Deal, DealStage, Pipeline, Task, Activity

# Создание таблиц
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.API_TITLE,
    description="Simple and affordable CRM for small business",
    version=settings.API_VERSION
)

# CORS
origins = settings.CORS_ORIGINS.split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "message": "noctoCRM API",
        "version": settings.API_VERSION,
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}
