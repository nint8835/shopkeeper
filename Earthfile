VERSION 0.8

pip-lockfile:
    FROM ghcr.io/astral-sh/uv:python3.13-bookworm
    WORKDIR /shopkeeper

    COPY pyproject.toml uv.lock ./
    RUN uv pip compile pyproject.toml -o requirements.txt

    SAVE ARTIFACT requirements.txt

python-deps:
    FROM python:3.13-slim
    WORKDIR /shopkeeper

    ENV LANG=C.UTF-8
    ENV PYTHONDONTWRITEBYTECODE=1
    ENV PYTHONUNBUFFERED=1
    ENV PATH="/shopkeeper/venv/bin:$PATH"

    RUN apt-get update && apt-get install -y --no-install-recommends gcc libc6-dev && rm -rf /var/lib/apt/lists/*

    RUN python -m venv /shopkeeper/venv
    COPY +pip-lockfile/requirements.txt .

    RUN pip install --no-cache-dir -r requirements.txt

    SAVE ARTIFACT venv

node-deps:
    FROM node:lts-slim
    WORKDIR /shopkeeper

    COPY package.json package-lock.json ./
    RUN npm install

    SAVE ARTIFACT node_modules

frontend:
    FROM node:lts-slim
    WORKDIR /shopkeeper

    COPY +node-deps/node_modules ./node_modules

    COPY package.json package-lock.json vite.config.ts tsconfig.json tsconfig.node.json ./
    COPY frontend frontend
    RUN npm run build

    SAVE ARTIFACT --keep-ts frontend/dist

app:
    ARG TAG

    FROM python:3.13-slim
    WORKDIR /shopkeeper

    RUN groupadd -g 65532 nonroot && useradd -u 65532 -g nonroot -s /sbin/nologin nonroot

    ENV PYTHONUNBUFFERED=1
    ENV PATH="/shopkeeper/venv/bin:$PATH"

    COPY +python-deps/venv /shopkeeper/venv
    COPY --keep-ts +frontend/dist /shopkeeper/frontend/dist
    COPY . .

    RUN chown -R nonroot:nonroot /shopkeeper

    USER nonroot

    ENTRYPOINT ["python", "-m", "shopkeeper"]
    CMD ["start"]

    SAVE IMAGE --push ghcr.io/nint8835/shopkeeper:latest ghcr.io/nint8835/shopkeeper:$TAG
