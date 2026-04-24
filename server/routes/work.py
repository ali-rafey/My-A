import json
from pathlib import Path

from fastapi import APIRouter

from models.work import WorkProject

router = APIRouter()
DATA_FILE = Path(__file__).resolve().parent.parent / 'data' / 'work.json'


@router.get('/work')
def get_work() -> list[WorkProject]:
    with DATA_FILE.open(encoding='utf-8') as file:
        payload = json.load(file)
    return [WorkProject(**item) for item in payload]
