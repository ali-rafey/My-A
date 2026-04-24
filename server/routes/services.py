import json
from pathlib import Path

from fastapi import APIRouter

from models.service import Service

router = APIRouter()
DATA_FILE = Path(__file__).resolve().parent.parent / 'data' / 'services.json'


@router.get('/services')
def get_services() -> list[Service]:
    with DATA_FILE.open(encoding='utf-8') as file:
        payload = json.load(file)
    return [Service(**item) for item in payload]
