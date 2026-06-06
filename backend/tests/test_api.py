def test_rejestracja_i_duplikat(client):
    r = client.post("/auth/register", params={"username": "u1", "password": "pw123456"})
    assert r.status_code == 200
    r2 = client.post("/auth/register", params={"username": "u1", "password": "pw123456"})
    assert r2.status_code == 400


def test_logowanie_poprawne_i_bledne(client):
    client.post("/auth/register", params={"username": "u2", "password": "pw123456"})
    ok = client.post("/auth/login", data={"username": "u2", "password": "pw123456"})
    assert ok.status_code == 200
    assert "access_token" in ok.json()

    bad = client.post("/auth/login", data={"username": "u2", "password": "zle"})
    assert bad.status_code == 401


def test_endpoint_chroniony_wymaga_tokenu(client):
    assert client.get("/habits/today").status_code == 401


def test_pelny_cykl_crud_nawyku(client, auth_headers):
    r = client.post("/habits/", json={"name": "Bieganie", "category": "zdrowie"}, headers=auth_headers)
    assert r.status_code == 200
    habit_id = r.json()["id"]

    today = client.get("/habits/today", headers=auth_headers).json()
    assert len(today) == 1
    assert today[0]["name"] == "Bieganie"
    assert today[0]["is_completed_today"] is False

    p = client.patch(f"/habits/{habit_id}", json={"name": "Maraton"}, headers=auth_headers)
    assert p.status_code == 200
    assert p.json()["name"] == "Maraton"

    d = client.delete(f"/habits/{habit_id}", headers=auth_headers)
    assert d.status_code == 200
    assert client.get("/habits/today", headers=auth_headers).json() == []


def test_oznaczanie_wykonania_i_idempotencja_oraz_streak(client, auth_headers):
    habit_id = client.post(
        "/habits/", json={"name": "Woda", "category": "zdrowie"}, headers=auth_headers
    ).json()["id"]

    c = client.post(f"/habits/{habit_id}/complete", headers=auth_headers)
    assert c.status_code == 200

    c2 = client.post(f"/habits/{habit_id}/complete", headers=auth_headers)
    assert "już" in c2.json()["message"].lower()

    today = client.get("/habits/today", headers=auth_headers).json()
    assert today[0]["is_completed_today"] is True

    s = client.get(f"/habits/{habit_id}/streak", headers=auth_headers).json()
    assert s["current_streak"] == 1


def test_daily_activity_uzupelnia_zerami(client, auth_headers):
    habit_id = client.post(
        "/habits/", json={"name": "Czytanie", "category": "relaks"}, headers=auth_headers
    ).json()["id"]
    client.post(f"/habits/{habit_id}/complete", headers=auth_headers)

    data = client.get("/stats/daily-activity?days=7", headers=auth_headers).json()
    assert len(data) == 7
    assert data[-1]["completed_count"] == 1
    assert data[0]["completed_count"] == 0


def test_ranking_sortuje_po_liczbie_wykonan(client, auth_headers):
    h1 = client.post("/habits/", json={"name": "A", "category": "praca"}, headers=auth_headers).json()["id"]
    client.post("/habits/", json={"name": "B", "category": "praca"}, headers=auth_headers)
    client.post(f"/habits/{h1}/complete", headers=auth_headers)

    ranking = client.get("/stats/ranking", headers=auth_headers).json()
    assert ranking[0]["habit_name"] == "A"
    assert ranking[0]["total_completions"] == 1


def test_uzytkownik_nie_ma_dostepu_do_cudzych_nawykow(client, auth_headers):
    habit_id = client.post(
        "/habits/", json={"name": "Sekret", "category": "praca"}, headers=auth_headers
    ).json()["id"]

    client.post("/auth/register", params={"username": "intruz", "password": "pw123456"})
    tok = client.post("/auth/login", data={"username": "intruz", "password": "pw123456"}).json()["access_token"]
    other = {"Authorization": f"Bearer {tok}"}

    assert client.patch(f"/habits/{habit_id}", json={"name": "x"}, headers=other).status_code == 404
    assert client.post(f"/habits/{habit_id}/complete", headers=other).status_code == 404
    assert client.get(f"/habits/{habit_id}/streak", headers=other).status_code == 404
    assert client.delete(f"/habits/{habit_id}", headers=other).status_code == 404
