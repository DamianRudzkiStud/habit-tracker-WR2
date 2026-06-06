# Habit Tracker

Aplikacja do śledzenia codziennych nawyków. Projekt składa się z dwóch części:

- **`backend/`** – API w FastAPI (SQLModel + SQLite, autoryzacja JWT)
- **`frontend/`** – aplikacja React (Vite + Tailwind + Recharts)

## Struktura projektu

```
WR2/
├── backend/                 # API (FastAPI)
│   ├── main.py              # punkt wejścia + konfiguracja CORS
│   ├── database.py          # silnik bazy SQLite
│   ├── models.py            # modele User / Habit / HabitLog
│   ├── seed.py              # generowanie danych demo
│   ├── requirements.txt     # zależności Pythona
│   ├── tests/               # testy jednostkowe i API (pytest)
│   └── routers/             # auth, habits, tracking, stats
├── frontend/                # aplikacja React (Vite)
│   └── src/
│       └── __tests__/       # smoke testy GUI (Vitest)
├── docs/
│   └── QA.md                # plan i dokumentacja testów
├── Instrukcja ustawienia projektu.docx
└── README.md
```

## Wymagania

- Python 3.9+ (testowane na 3.13)
- Node.js 18+ (testowane na 23) + npm

## Uruchomienie backendu

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Wygenerowanie danych demo (tworzy database.db oraz konto demo_user)
python seed.py

# Start serwera
fastapi dev main.py
# lub: uvicorn main:app --reload
```

Serwer ruszy na **http://127.0.0.1:8000**, a interaktywna dokumentacja
endpointów jest dostępna pod **http://127.0.0.1:8000/docs**.

Konto demo utworzone przez `seed.py`:

- login: **demo_user**
- hasło: **password123**

## Uruchomienie frontendu

```bash
cd frontend
npm install
npm run dev
```

Aplikacja będzie dostępna pod **http://localhost:5173**. Backend ma włączony
CORS dla `http://localhost:5173` oraz `http://127.0.0.1:5173`, więc frontend
łączy się z API bez dodatkowej konfiguracji (adres API: `http://127.0.0.1:8000`,
ustawiony w `frontend/src/api/axios.js`).

> Uwaga: żeby aplikacja działała, **oba** serwery (backend i frontend) muszą
> być uruchomione jednocześnie.

## Testy

Backend (pytest):

```bash
cd backend
source .venv/bin/activate
pip install -r requirements-dev.txt
pytest
```

Frontend (Vitest):

```bash
cd frontend
npm test
```

Opis poziomów testów i checklista testów manualnych znajdują się w
[docs/QA.md](docs/QA.md).

## Przegląd endpointów

Wszystkie endpointy poza rejestracją i logowaniem wymagają nagłówka
`Authorization: Bearer <token_jwt>`.

| Metoda | Endpoint                      | Opis                                              |
|--------|-------------------------------|---------------------------------------------------|
| POST   | `/auth/register`              | Rejestracja (username i password jako query)      |
| POST   | `/auth/login`                 | Logowanie (Form Data) → zwraca `access_token`     |
| POST   | `/habits/`                    | Utworzenie nawyku (`name`, `category`)            |
| GET    | `/habits/today`              | Lista nawyków z flagą `is_completed_today`        |
| PATCH  | `/habits/{id}`               | Edycja nawyku                                      |
| DELETE | `/habits/{id}`               | Usunięcie nawyku wraz z historią                  |
| POST   | `/habits/{id}/complete`      | Oznaczenie nawyku jako wykonany dziś              |
| GET    | `/habits/{id}/streak`        | Aktualna seria dni (`current_streak`)            |
| GET    | `/stats/daily-activity?days=7`| Aktywność z ostatnich X dni (uzupełniana zerami)  |
| GET    | `/stats/ranking`             | Ranking TOP 5 najczęściej realizowanych nawyków   |
