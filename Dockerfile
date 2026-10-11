# --- Stage 1: build the React bundle into frontend/static/dist ---
FROM node:22-alpine AS frontend

WORKDIR /app/frontend/lodwar
COPY frontend/lodwar/package.json frontend/lodwar/yarn.lock ./
RUN yarn install --frozen-lockfile
COPY frontend/lodwar/ ./
RUN yarn build

# --- Stage 2: Django backend ---
FROM python:3.12-slim

WORKDIR /app/backend

# set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV POETRY_VIRTUALENVS_CREATE=false

# install poetry
RUN pip install --upgrade pip && pip install poetry

# copy poetry files
COPY pyproject.toml poetry.lock* ./

# install dependencies
RUN poetry install --no-interaction --no-ansi --no-root

# Copy the rest of the application code
COPY . /app/backend/
COPY --from=frontend /app/frontend/static/dist /app/backend/frontend/static/dist

RUN chmod +x ./entrypoint.sh

ENTRYPOINT ["/app/backend/entrypoint.sh"]
CMD [ "python3", "manage.py", "runserver", "0.0.0.0:8888" ]
