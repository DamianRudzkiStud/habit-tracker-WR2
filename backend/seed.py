import random
from datetime import date, timedelta
from sqlmodel import Session, SQLModel
from database import engine
from models import Habit, HabitLog, User
from routers.auth import hash_password


def seed_demo_data():
    print("Inicjalizacja bazy danych...")
    SQLModel.metadata.create_all(engine)

    with Session(engine) as session:
        print("Czyszczenie starych danych...")
        session.query(HabitLog).delete()
        session.query(Habit).delete()
        session.query(User).delete()
        session.commit()

        print("Tworzenie użytkownika demo...")
        demo_user = User(
            username="demo_user",
            hashed_password=hash_password("password123")
        )
        session.add(demo_user)
        session.commit()  # Commitujemy, aby baza nadała userowi ID
        session.refresh(demo_user)
        print(f"Tworzenie nawyków dla użytkownika {demo_user.username}...")
        habits = [
            Habit(name="Trening", category="zdrowie", user_id=demo_user.id),
            Habit(name="Czytanie książki", category="relaks", user_id=demo_user.id),
            Habit(name="Kodowanie", category="praca", user_id=demo_user.id),
            Habit(name="Medytacja", category="zdrowie", user_id=demo_user.id),
            Habit(name="Planowanie", category="praca", user_id=demo_user.id),
        ]

        for habit in habits:
            session.add(habit)
        session.commit()

        print("Generowanie historii wykonania (ostatnie 30 dni)...")
        today = date.today()


        success_rates = {
            "Trening": 0.4,  # 40% szans każdego dnia
            "Czytanie książki": 0.8,  # 80% szans
            "Kodowanie": 0.6,  # 60% szans
            "Medytacja": 0.3,  # 30% szans
            "Planowanie": 0.9  # 90% szans
        }

        log_count = 0
        # Przechodzimy dzień po dniu, 30 dni wstecz
        for day_offset in range(30):
            current_date = today - timedelta(days=day_offset)

            for habit in habits:
                chance = success_rates[habit.name]

                if habit.name == "Planowanie jutrzejszego dnia" and day_offset < 6:
                    should_complete = True
                else:
                    should_complete = random.random() < chance

                if should_complete:
                    log = HabitLog(habit_id=habit.id, date_completed=current_date)
                    session.add(log)
                    log_count += 1

        session.commit()
        print("\n=== GENEROWANIE DANYCH ZAKOŃCZONE Z SUKCESEM ===")
        print(f"Utworzono użytkownika: {demo_user.username} (hasło: password123)")
        print(f"Dodano nawyków: {len(habits)}")
        print(f"Wygenerowano logów historycznych: {log_count}")


if __name__ == "__main__":
    seed_demo_data()