from pydantic import BaseModel


class Service(BaseModel):
    id: int
    title: str
    description: str
