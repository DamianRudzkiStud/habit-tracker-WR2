from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from datetime import date, timedelta
from database import get_session
from models import Habit, HabitLog, User
from routers.auth import get_current_user

router = APIRouter(
    prefix="/habits",
    tags=["Tracking"]
)


def calculate_current_streak(completed_dates: set, today: date) -> int:
    # Seria liczona wstecz od dzisiaj; jeśli dziś brak wpisu, ale jest wczoraj, seria trwa
    check_date = today
    if check_date not in completed_dates:
        check_date -= timedelta(days=1)
        if check_date not in completed_dates:
            return 0

    streak = 0
    while check_date in completed_dates:
        streak += 1
        check_date -= timedelta(days=1)
    return streak


@router.post("/{habit_id}/complete")
def complete_habit_today(
        habit_id: int,
        session: Session = Depends(get_session),
        current_user: User = Depends(get_current_user)
):
    # Weryfikacja właściciela nawyku
    db_habit = session.get(Habit, habit_id)
    if not db_habit or db_habit.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Nie znaleziono nawyku")

    today = date.today()
    existing_log = session.exec(
        select(HabitLog).where(HabitLog.habit_id == habit_id, HabitLog.date_completed == today)
    ).first()

    if existing_log:
        return {"message": "Nawyk został już oznaczony jako wykonany dzisiaj"}

    new_log = HabitLog(habit_id=habit_id, date_completed=today)
    session.add(new_log)
    session.commit()
    return {"message": "Nawyk oznaczony jako wykonany!", "date": today}


@router.get("/{habit_id}/streak")
def get_habit_streak(
        habit_id: int,
        session: Session = Depends(get_session),
        current_user: User = Depends(get_current_user)
):
    # Weryfikacja właściciela nawyku
    db_habit = session.get(Habit, habit_id)
    if not db_habit or db_habit.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Nie znaleziono nawyku")

    logs = session.exec(
        select(HabitLog).where(HabitLog.habit_id == habit_id).order_by(HabitLog.date_completed.desc())
    ).all()

    if not logs:
        return {"habit_name": db_habit.name, "current_streak": 0}

    completed_dates = {log.date_completed for log in logs}
    streak = calculate_current_streak(completed_dates, date.today())

    return {"habit_name": db_habit.name, "current_streak": streak}