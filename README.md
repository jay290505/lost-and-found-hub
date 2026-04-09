# Firebase Studio

This is a NextJS starter in Firebase Studio.


To get started, take a look at src/app/page.tsx.

Quick: interactive env setup (PowerShell)

If you prefer not to edit files by hand, there's a helper script that interactively creates `.env.local` and `backend/.env` for you. From the project root run:

```powershell
.\scripts\setup-env.ps1
```

The script will prompt for local API values and will write `.env.local` and `backend/.env`, and add entries to `.gitignore` so these secrets are not committed.

## Run locally (Django backend + Next.js frontend)

These steps are for Windows PowerShell (the repo already includes a Django backend in `backend/` and a Next.js app at the project root).

1) Backend (Django)

Open PowerShell, then:

```powershell
# create and activate a virtualenv in the backend folder
cd backend; python -m venv .venv; .\.venv\Scripts\Activate.ps1

# install requirements
pip install -r requirements.txt

# create database migrations and apply them
python manage.py migrate

# (optional) create a superuser for admin
python manage.py createsuperuser

# run the Django dev server on the default port 8000
python manage.py runserver 8000
```

The API base will be available at http://127.0.0.1:8000/api/

2) Frontend (Next.js)

Open a separate PowerShell window at the project root and run:

```powershell
# install node deps (only needed once)
npm install

# start the Next.js dev server (port 3000)
npm run dev
```

3) Quick API test from the frontend machine

From any PowerShell window you can use curl to test the backend ping/health endpoint:

```powershell
curl http://127.0.0.1:8000/api/health/
```

You should see a JSON response like:

{"status":"ok"}

If you run the frontend on port 3000, the Django backend (`backend/backend/settings.py`) already allows CORS from `http://localhost:3000`.

If you'd like, I can add a tiny `/api/ping/` view (and update `backend/core/urls.py`) to give a single dedicated test endpoint for the frontend. Tell me if you want that wired up now.


