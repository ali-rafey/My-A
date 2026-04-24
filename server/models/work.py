from pydantic import BaseModel


class WorkProject(BaseModel):
    id: int
    title: str
    description: str
    tag: str
