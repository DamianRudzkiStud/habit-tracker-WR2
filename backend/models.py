from datetime import date
from typing import Optional, List
from sqlmodel import Field, SQLModel, Relationship

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(unique=True, index=True)
    hashed_password: str

    habits: List["Habit"] = Relationship(back_populates="user")

class Habit(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    category: str
    user_id: int = Field(foreign_key="user.id")
    created_at: date = Field(default_factory=date.today)
    user: Optional[User] = Relationship(back_populates="habits")

class HabitLog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    habit_id: int = Field(foreign_key="habit.id")
    date_completed: date = Field(default_factory=date.today)

class HabitCreate(SQLModel):
    name: str
    category: str

class HabitUpdate(SQLModel):
    name: Optional[str] = None
    category: Optional[str] = None


