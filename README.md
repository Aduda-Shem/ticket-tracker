# Lodwar Tickets – Mini Ticket Tracker

A small support-ticket tracker: a REST API, a PostgreSQL database and a single-page UI.

* **Backend:** Django 5.2 + Django REST Framework
* **Database:** PostgreSQL
* **Frontend:** React 19 (Vite) + Redux, styled with Tailwind
* **Docs:** Swagger UI generated from the views (drf-yasg)

---

## Quick Start (Docker, recommended)

```sh
docker compose up --build
```

This builds the React bundle, starts Postgres, runs migrations and serves everything on port 8888.

| What           | URL                              |
| -------------- | -------------------------------- |
| App            | http://localhost:8888/           |
| API            | http://localhost:8888/api/v1/    |
| Swagger docs   | http://localhost:8888/swagger/   |

Run the tests inside the container:

```sh
docker compose exec backend python manage.py test
```

---

## Local Setup (without Docker)

Requires Python 3.12+, Node 20+, Yarn and a running PostgreSQL.

### 1. Backend

```sh
cp .env-example .env          # edit the POSTGRES_* values to match your database
createdb lodwar_tickets

python -m venv .venv && source .venv/bin/activate
pip install poetry && poetry install --no-root

python manage.py migrate
python manage.py runserver 8888
```

### 2. Frontend

```sh
cd frontend/lodwar && yarn install
yarn build        # one-off build into frontend/static/dist, served by Django
# or
yarn watch        # rebuild on change
# or
yarn dev          # Vite dev server on :5173 with hot reload, proxies /api to :8888
```

### 3. Tests and formatting

```sh
python manage.py test
black . --exclude '/(\.venv|node_modules|migrations)/'
```

The tests create and destroy a throwaway `test_<db>` database, so your Postgres user needs `CREATEDB`.

---


```sh
curl -X POST localhost:8888/api/v1/tickets -H 'Content-Type: application/json' \
     -d '{"title": "Printer jammed", "priority": "high"}'

curl 'localhost:8888/api/v1/tickets?status=open&page=1&limit=10'
# {"message": "...", "tickets": [...], "pagination": {"page": 1, "limit": 10, "total": 7, "total_pages": 1}}

curl -X PATCH localhost:8888/api/v1/tickets/<id> -H 'Content-Type: application/json' \
     -d '{"status": "in_progress"}'

curl localhost:8888/api/v1/tickets/stats
# {"message": "...", "stats": {"open": 3, "in_progress": 1, "closed": 1, "total": 5}}
```

---

## Project Structure

```
core/                 Django project: settings, root urls, shared exception handler
ticket/               The tickets app
  models/             Ticket model (status/priority enums, index)
  serializers/        Input validation and response shapes
  views/              APIViews for list/create, patch and stats
  tests/              API integration tests (run against real Postgres)
frontend/             Django app that serves the SPA shell (templates/index.html)
  lodwar/             React source (Vite), built into frontend/static/dist
    src/redux/        Store, action types, thunks (actions/) and reducers
    src/views/        Ticket page and its components
```

