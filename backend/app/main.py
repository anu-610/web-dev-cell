from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.v1.router import router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Tables are managed by Alembic; nothing to create here.
    yield


app = FastAPI(
    title="Web Dev Cell API",
    version="2.0.0",
    description="KamandPrompt · IIT Mandi — backend for the official WebDevCell portal",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/health", tags=["health"])
async def health():
    return {"status": "ok"}
