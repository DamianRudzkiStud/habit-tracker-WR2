from datetime import date, timedelta

import jwt
import pytest

from routers.auth import (
    ALGORITHM,
    SECRET_KEY,
    create_access_token,
    hash_password,
    verify_password,
)
from routers.tracking import calculate_current_streak


def test_hash_password_nie_jest_jawne():
    h = hash_password("password123")
    assert h != "password123"
    assert h.startswith("$2")


def test_verify_password_poprawne_i_bledne():
    h = hash_password("password123")
    assert verify_password("password123", h) is True
    assert verify_password("zle_haslo", h) is False


def test_token_zawiera_dane_i_date_wygasniecia():
    token = create_access_token({"sub": "demo_user"})
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    assert payload["sub"] == "demo_user"
    assert "exp" in payload


def test_zmanipulowany_token_jest_odrzucany():
    token = create_access_token({"sub": "demo_user"})
    with pytest.raises(jwt.PyJWTError):
        jwt.decode(token + "zepsute", SECRET_KEY, algorithms=[ALGORITHM])


TODAY = date(2026, 6, 6)


def test_streak_brak_wpisow():
    assert calculate_current_streak(set(), TODAY) == 0


def test_streak_tylko_dzisiaj():
    assert calculate_current_streak({TODAY}, TODAY) == 1


def test_streak_trzy_dni_pod_rzad_z_dzisiaj():
    dates = {TODAY, TODAY - timedelta(days=1), TODAY - timedelta(days=2)}
    assert calculate_current_streak(dates, TODAY) == 3


def test_streak_liczy_gdy_wczoraj_zrobione_a_dzis_jeszcze_nie():
    assert calculate_current_streak({TODAY - timedelta(days=1)}, TODAY) == 1


def test_streak_zero_gdy_przerwa_dwoch_dni():
    assert calculate_current_streak({TODAY - timedelta(days=2)}, TODAY) == 0


def test_streak_zatrzymuje_sie_na_przerwie():
    dates = {TODAY, TODAY - timedelta(days=1), TODAY - timedelta(days=3)}
    assert calculate_current_streak(dates, TODAY) == 2
