from .auth import router as auth_router
from .users import router as users_router
from .clients import router as clients_router
from .pipelines import router as pipelines_router
from .deals import router as deals_router

__all__ = [
    'auth_router',
    'users_router',
    'clients_router',
    'pipelines_router',
    'deals_router',
]
