from fastapi import APIRouter

from models.contact import ContactForm

router = APIRouter()


@router.post('/contact')
def submit_contact(form: ContactForm) -> dict[str, str]:
    print(f'Contact form received: {form.model_dump()}')
    return {'status': 'success', 'message': 'We will get back to you soon'}
