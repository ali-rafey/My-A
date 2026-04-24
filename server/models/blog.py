from pydantic import BaseModel


class Blog(BaseModel):
    id: int
    title: str
    date: str
    summary: str
