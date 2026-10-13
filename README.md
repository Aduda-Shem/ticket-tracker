# Ticket Tracker

A small support-ticket tracker. Django REST Framework + PostgreSQL on the backend, React (Vite) + Redux on the frontend.

## Setup & Run

**With Docker (easiest):**

```sh
docker compose up --build
```

Open http://localhost:8888. API docs are at http://localhost:8888/swagger/.

**Without Docker** (needs Python 3.12+, Node 20+, Yarn, PostgreSQL):

```sh
cp .env-example .env              # set your POSTGRES_* values
createdb lodwar_tickets
pip install poetry && poetry install --no-root
python manage.py migrate

cd frontend/lodwar && yarn install && yarn build && cd ../..
python manage.py runserver 8888
```

## API

All under `/api/v1`:

- `POST /tickets`: create a ticket (`title` required)
- `GET /tickets?status=&page=&limit=`: list, newest first
- `PATCH /tickets/:id`: change `status` and/or `priority`
- `GET /tickets/stats`: count per status

## Tests

```sh
python manage.py test             # or: docker compose exec backend python manage.py test
```

The API tests in `ticket/tests/` run against a real Postgres test database. They cover create, list (filtering + pagination), patch and stats, including the error cases.

## Decisions & Tradeoffs

I used the same layout I use on my other Django + React projects, which is a bit more structure than five endpoints need, but it's how I'd grow it. PATCH only accepts `status` and `priority` and rejects anything else with a 400, rather than silently ignoring it. Pagination is plain offset/limit. That's fine at this size, but with a lot of tickets I'd switch to cursor pagination. After a create or update, the UI just refetches the list and stats, because a status change can move a ticket off the current filter. The biggest shortcut is that there's no authentication: it's one shared board. I also skipped deleting tickets, editing titles, and frontend tests, and it runs on Django's dev server. With more time I'd add auth with ticket owners and assignees, a proper production setup (gunicorn, static files, CI), and a history of status changes.
