import json
from pathlib import Path

from fastapi import APIRouter

from models.blog import Blog

router = APIRouter()
DATA_FILE = Path(__file__).resolve().parent.parent / 'data' / 'blogs.json'


@router.get('/blogs')
def get_blogs() -> list[Blog]:
    with DATA_FILE.open(encoding='utf-8') as file:
        payload = json.load(file)
    return [Blog(**item) for item in payload]
