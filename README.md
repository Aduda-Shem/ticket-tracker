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

## API

All endpoints are under `/api/v1`. The trailing slash is optional: `/tickets` and `/tickets/` both work.
Every response has a `message` field. Validation errors return `400` with `{"message": "...", "errors": {field: [...]}}`.

| Method  | Path                 | Description |
| ------- | -------------------- | ----------- |
| `POST`  | `/tickets`           | Create a ticket. Requires `title`. Optional: `description`, `priority` (default `medium`), `status` (default `open`). |
| `GET`   | `/tickets`           | List tickets, newest first. Query params: `status`, `page` (default 1), `limit` (default 20, max 100). |
| `PATCH` | `/tickets/:id`       | Update `status` and/or `priority`. Any other field returns `400`. An unknown or malformed id returns `404`. |
| `GET`   | `/tickets/stats`     | Ticket counts per status, plus `total`. Every status is always present, including ones with a count of 0. |

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
  models/             Ticket model (enums, DB check constraints, index)
  serializers/        Input validation and response shapes
  views/              APIViews for list/create, patch and stats
  tests/              API integration tests (run against real Postgres)
frontend/             Django app that serves the SPA shell (templates/index.html)
  lodwar/             React source (Vite), built into frontend/static/dist
    src/redux/        Store, action types, thunks (actions/) and reducers
    src/views/        Ticket page and its components
```

---

## Decisions & Tradeoffs

I followed the structure I use in production Django + React projects (apps split into `models/`, `serializers/` and `views/`, Redux actions and reducers on the frontend). That is more structure than five endpoints strictly need, but it shows how the code would grow. Status and priority are validated in the serializer and also enforced by a Postgres `CHECK` constraint. `PATCH` returns `400` for any field other than status/priority instead of silently ignoring it, and invalid `status`/`page`/`limit` params return `400` instead of an empty list. Pagination is a simple offset/limit with a stable sort (`-created_at, -id`); at real scale I'd move to cursor pagination and drop the `COUNT(*)`. Stats are a single `GROUP BY`, and statuses with no tickets are filled in with 0 so clients never handle missing keys. In the UI, the stat tiles double as the status filter. After a create or update the UI refetches the list instead of patching local state, because a status change can move a ticket out of the current filter or page; that costs one extra request but keeps the screen correct. The main shortcuts: there is no authentication (it's one shared, open board), no delete or title/description editing, no frontend tests, and the app runs on Django's dev server even in Docker. With more time I'd add token auth with requester/assignee ownership, a `gunicorn` + `whitenoise` production image with CI, React Testing Library tests with optimistic updates, and an audit trail of status changes.
