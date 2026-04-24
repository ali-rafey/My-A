from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.blogs import router as blogs_router
from routes.contact import router as contact_router
from routes.services import router as services_router
from routes.work import router as work_router

app = FastAPI(title='YourAgency API')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:5173'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(contact_router, prefix='/api')
app.include_router(blogs_router, prefix='/api')
app.include_router(services_router, prefix='/api')
app.include_router(work_router, prefix='/api')


@app.get('/api/health')
def health() -> dict[str, str]:
    return {'status': 'ok'}
