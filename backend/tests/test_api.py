import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "app": "AutoPilot", "version": "1.0.0"}

def test_create_meeting_unauthorized():
    response = client.post("/meetings/create", json={"title": "Test Meeting"})
    assert response.status_code == 401

def test_get_meetings_unauthorized():
    response = client.get("/meetings/")
    assert response.status_code == 401

def test_swagger_ui():
    response = client.get("/docs")
    assert response.status_code == 200
