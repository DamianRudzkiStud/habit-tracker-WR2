# Plan i dokumentacja QA – Habit Tracker

Dokument opisuje proces zapewnienia jakości (QA) w projekcie. Testy są
podzielone na trzy poziomy: jednostkowe, API oraz smoke testy GUI. Dodatkowo
opisana jest krótka checklista testów manualnych całej aplikacji.

## Zakres

| Poziom            | Część projektu | Narzędzie                         | Lokalizacja                          |
|-------------------|----------------|-----------------------------------|--------------------------------------|
| Testy jednostkowe | backend        | pytest                            | `backend/tests/test_unit.py`         |
| Testy API         | backend        | pytest + FastAPI TestClient       | `backend/tests/test_api.py`          |
| Smoke testy GUI   | frontend       | Vitest + React Testing Library    | `frontend/src/__tests__/smoke.test.jsx` |
| Testy manualne    | całość         | przeglądarka                      | checklista poniżej                   |

## 1. Testy jednostkowe (backend)

Sprawdzają czystą logikę, bez bazy danych i bez warstwy HTTP:

- hashowanie i weryfikacja haseł (`hash_password`, `verify_password`),
- generowanie i walidacja tokenu JWT (`create_access_token`),
- algorytm liczenia serii dni (`calculate_current_streak`) – przypadki: brak
  wpisów, tylko dzisiaj, kilka dni pod rząd, wczoraj bez dzisiaj, przerwa
  dwudniowa, przerwanie serii.

## 2. Testy API (backend)

Uruchamiane na bazie SQLite w pamięci (RAM), odizolowanej od produkcyjnego
`database.db`. Zależność `get_session` jest podmieniana w testach, więc dane nie
mieszają się między przypadkami. Pokrycie:

- rejestracja konta i odrzucenie duplikatu nazwy,
- logowanie poprawne i błędne (status 200 / 401),
- ochrona endpointów bez tokenu (401),
- pełny cykl CRUD nawyku (create → today → patch → delete),
- oznaczanie wykonania, idempotencja powtórnego oznaczenia i seria = 1,
- statystyki dzienne uzupełniane zerami dla pustych dni,
- ranking sortowany po liczbie wykonań,
- izolacja użytkowników – brak dostępu do cudzych nawyków (404).

## 3. Smoke testy GUI (frontend)

Lekkie testy renderowania w środowisku jsdom (bez przeglądarki i bez
uruchomionego backendu). Weryfikują, że kluczowe ekrany montują się bez błędów:

- ekran logowania renderuje formularz (pola login/hasło, przycisk),
- ekran rejestracji renderuje formularz,
- niezalogowany użytkownik jest przekierowany na ekran logowania.

## Uruchamianie testów

Backend:

```bash
cd backend
source .venv/bin/activate
pip install -r requirements-dev.txt
pytest
```

Frontend:

```bash
cd frontend
npm install
npm test
```

## Stan testów

- Backend: 18 testów (4 jednostkowe auth + 6 jednostkowych streak + 8 API).
- Frontend: 3 smoke testy GUI.
- Łącznie 21 testów, wszystkie przechodzą.

## Testy manualne (checklista smoke)

Przy obu uruchomionych serwerach (backend `127.0.0.1:8000`, frontend
`localhost:5173`):

1. Logowanie kontem `demo_user` / `password123`.
2. Dashboard pokazuje listę nawyków oraz liczniki (wszystkie / wykonane / pozostało).
3. Dodanie nowego nawyku – pojawia się na liście.
4. Oznaczenie nawyku jako wykonany – status zmienia się na „Wykonano", seria rośnie.
5. Edycja i usunięcie nawyku.
6. Zakładka Statystyki – wykres aktywności z 7 dni oraz ranking TOP 5.
7. Wylogowanie i próba wejścia na `/` – przekierowanie na logowanie.

## Znane uwagi i ograniczenia

- Backend generuje ostrzeżenia o deprecacji z bibliotek/kodu źródłowego
  (`datetime.utcnow()`, `obj.dict()` w SQLModel, krótki klucz HMAC). Nie wpływają
  na działanie ani na wynik testów.
- Ranking (`/stats/ranking`) używa złączenia wewnętrznego, więc nawyki bez ani
  jednego wykonania nie pojawiają się w rankingu.
- Klucz JWT (`SECRET_KEY`) jest wartością przykładową – do wdrożenia
  produkcyjnego należałoby przenieść go do zmiennych środowiskowych.

## Możliwe rozszerzenia

- Pełne testy E2E w przeglądarce (np. Playwright) na uruchomionym stacku.
- Uruchamianie testów automatycznie w CI (GitHub Actions) przy każdym pushu.
- Pomiar pokrycia kodu (`pytest --cov`, `vitest --coverage`).
