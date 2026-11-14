import pytest
import httpx

BASE_URL = "http://localhost:8002"

def _register_payload(email="test@example.com"):
    return {
        "first_name": "Test",
        "last_name": "User",
        "email": email,
        "password": "secret123",
        "drone_registration_number": "GB1234567890",
        "flyer_id": "FLY-ABC-123",
    }

@pytest.mark.asyncio
async def test_health():
    async with httpx.AsyncClient() as client:
        r = await client.get(f"{BASE_URL}/health")
        assert r.status_code == 200
        assert r.json() == {"status": "ok"}

@pytest.mark.asyncio
async def test_register_returns_201():
    async with httpx.AsyncClient() as client:
        r = await client.post(f"{BASE_URL}/auth/register", json=_register_payload("register-test@example.com"))
        assert r.status_code in (201, 409)  # 409 if test re-run

@pytest.mark.asyncio
async def test_register_duplicate_returns_409():
    async with httpx.AsyncClient() as client:
        await client.post(f"{BASE_URL}/auth/register", json=_register_payload("dup-test@example.com"))
        r = await client.post(f"{BASE_URL}/auth/register", json=_register_payload("dup-test@example.com"))
        assert r.status_code == 409

@pytest.mark.asyncio
async def test_login_valid():
    async with httpx.AsyncClient() as client:
        await client.post(f"{BASE_URL}/auth/register", json=_register_payload("login-test@example.com"))
        r = await client.post(f"{BASE_URL}/auth/login", json={
            "email": "login-test@example.com", "password": "secret123"
        })
        assert r.status_code == 200
        body = r.json()
        assert "token" in body
        assert "user_id" in body

@pytest.mark.asyncio
async def test_login_invalid_password():
    async with httpx.AsyncClient() as client:
        await client.post(f"{BASE_URL}/auth/register", json=_register_payload("badpw@example.com"))
        r = await client.post(f"{BASE_URL}/auth/login", json={
            "email": "badpw@example.com", "password": "wrong"
        })
        assert r.status_code == 401

@pytest.mark.asyncio
async def test_profile_requires_token():
    async with httpx.AsyncClient() as client:
        r = await client.get(f"{BASE_URL}/auth/profile")
        assert r.status_code == 401

@pytest.mark.asyncio
async def test_profile_with_token():
    async with httpx.AsyncClient() as client:
        await client.post(f"{BASE_URL}/auth/register", json=_register_payload("profile@example.com"))
        login_r = await client.post(f"{BASE_URL}/auth/login", json={
            "email": "profile@example.com", "password": "secret123"
        })
        token = login_r.json()["token"]

        r = await client.get(f"{BASE_URL}/auth/profile", headers={"Authorization": f"Bearer {token}"})
        assert r.status_code == 200
        body = r.json()
        assert body["email"] == "profile@example.com"

@pytest.mark.asyncio
async def test_logout_blacklists_token():
    async with httpx.AsyncClient() as client:
        await client.post(f"{BASE_URL}/auth/register", json=_register_payload("logout@example.com"))
        login_r = await client.post(f"{BASE_URL}/auth/login", json={
            "email": "logout@example.com", "password": "secret123"
        })
        token = login_r.json()["token"]

        r = await client.post(f"{BASE_URL}/auth/logout", headers={"Authorization": f"Bearer {token}"})
        assert r.status_code == 200

        # Token should now be rejected on profile
        r = await client.get(f"{BASE_URL}/auth/profile", headers={"Authorization": f"Bearer {token}"})
        assert r.status_code == 401
