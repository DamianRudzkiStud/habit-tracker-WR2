from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from datetime import date
from database import get_session
from models import Habit, HabitCreate, HabitUpdate, HabitLog, User
from routers.auth import get_current_user

router = APIRouter(
    prefix="/habits",
    tags=["Nawyki"]
)


@router.post("/", response_model=Habit)
def create_habit(habit_data: HabitCreate, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    db_habit = Habit.model_validate(habit_data, update={"user_id": current_user.id})
    session.add(db_habit)
    session.commit()
    session.refresh(db_habit)
    return db_habit


@router.get("/today")
def read_habits_for_today(session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)):
    today = date.today()
    habits = session.exec(select(Habit).where(Habit.user_id == current_user.id)).all()
    result = []
    for habit in habits:
        log_exists = session.exec(
            select(HabitLog).where(HabitLog.habit_id == habit.id, HabitLog.date_completed == today)
        ).first()
        result.append({
            "id": habit.id,
            "name": habit.name,
            "category": habit.category,
            "is_completed_today": log_exists is not None
        })
    return result


@router.patch("/{habit_id}", response_model=Habit)
def update_habit(
        habit_id: int,
        habit_data: HabitUpdate,
        session: Session = Depends(get_session),
        current_user: User = Depends(get_current_user)
):
    db_habit = session.get(Habit, habit_id)
    # Sprawdzamy czy nawyk istnieje ORAZ czy należy do zalogowanego użytkownika
    if not db_habit or db_habit.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Nie znaleziono nawyku")

    habit_dict = habit_data.dict(exclude_unset=True)
    for key, value in habit_dict.items():
        setattr(db_habit, key, value)

    session.add(db_habit)
    session.commit()
    session.refresh(db_habit)
    return db_habit


@router.delete("/{habit_id}")
def delete_habit(
        habit_id: int,
        session: Session = Depends(get_session),
        current_user: User = Depends(get_current_user)
):
    db_habit = session.get(Habit, habit_id)
    if not db_habit or db_habit.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Nie znaleziono nawyku")

    session.delete(db_habit)

    # Usuwamy tylko logi powiązane z tym konkretnym nawykiem
    logs = session.exec(select(HabitLog).where(HabitLog.habit_id == habit_id)).all()
    for log in logs:
        session.delete(log)

    session.commit()
    return {"message": f"Nawyk o ID {habit_id} oraz jego historia zostały usunięte"}