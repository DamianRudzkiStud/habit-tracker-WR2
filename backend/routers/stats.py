from fastapi import APIRouter, Depends
from sqlmodel import Session, select, func
from datetime import date, timedelta
from database import get_session
from models import Habit, HabitLog, User
from routers.auth import get_current_user

router = APIRouter(prefix="/stats", tags=["Statystyki i Wykresy"])


@router.get("/daily-activity")
def get_daily_activity(
        days: int = 7,
        session: Session = Depends(get_session),
        current_user: User = Depends(get_current_user)
):
    start_date = date.today() - timedelta(days=days - 1)

    # Dołączamy tabelę Habit, żeby móc przefiltrować logi po użytkowniku
    query = (
        select(HabitLog.date_completed, func.count(HabitLog.id))
        .join(Habit, HabitLog.habit_id == Habit.id)
        .where(Habit.user_id == current_user.id, HabitLog.date_completed >= start_date)
        .group_by(HabitLog.date_completed)
        .order_by(HabitLog.date_completed.asc())
    )
    db_results = session.exec(query).all()
    results_dict = {row[0]: row[1] for row in db_results}

    chart_data = []
    for i in range(days):
        current_date = start_date + timedelta(days=i)
        chart_data.append({
            "date": current_date.isoformat(),
            "completed_count": results_dict.get(current_date, 0)
        })
    return chart_data


@router.get("/ranking")
def get_habits_ranking(
    limit: int = 5,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    # Filtrowanie rankingu po użytkowniku
    query = (
        select(Habit.name, func.count(HabitLog.id))
        .join(HabitLog, HabitLog.habit_id == Habit.id)
        .where(Habit.user_id == current_user.id)
        .group_by(Habit.name)
        .order_by(func.count(HabitLog.id).desc())
        .limit(limit)
    )
    results = session.exec(query).all()
    return [{"habit_name": row[0], "total_completions": row[1]} for row in results]