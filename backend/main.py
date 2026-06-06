
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
from sqlmodel import SQLModel
from routers import habits, tracking, stats, auth

app = FastAPI(title="Habit Tracker")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    SQLModel.metadata.create_all(engine)

app.include_router(auth.router)
app.include_router(habits.router)
app.include_router(tracking.router)
app.include_router(stats.router)

@app.get("/")
def home():
    return {"message": "API do śledzenia nawyków"}
