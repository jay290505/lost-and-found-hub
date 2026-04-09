# Django backend (minimal scaffold)

This folder contains a minimal Django project intended for local development alongside the Next.js frontend.

Setup (Windows PowerShell):

1. Create a virtual environment and activate it:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

2. Install dependencies:

```powershell
pip install -r requirements.txt
```

3. Run migrations and start the server:

```powershell
python manage.py migrate
python manage.py runserver 127.0.0.1:8000
```

Endpoints:

- GET /api/health/  -> health check
- GET /api/items/   -> sample items list

Notes:

- This is intentionally minimal. Add models, auth, and more APIs as needed.

Frontend integration

If you're running the Next.js frontend locally on the default port in this repo (9002), set the frontend environment variable so it knows where to call the API. In the frontend project root create a `.env.local` with:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

Then start the frontend (from project root):

```powershell
npm run dev
```

The frontend dev server runs on port 9002 by default for this project; CORS for that origin is already allowed in settings.
