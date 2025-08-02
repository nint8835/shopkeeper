VERSION 0.8

pip-lockfile:
    FROM ghcr.io/astral-sh/uv:python3.13-bookworm
    WORKDIR /shopkeeper

    COPY pyproject.toml uv.lock ./
    RUN uv pip compile pyproject.toml -o requirements.txt

    SAVE ARTIFACT requirements.txt

python-deps:
    FROM cgr.dev/chainguard/python:latest-dev
    WORKDIR /shopkeeper

    ENV LANG=C.UTF-8
    ENV PYTHONDONTWRITEBYTECODE=1
    ENV PYTHONUNBUFFERED=1
    ENV PATH="/shopkeeper/venv/bin:$PATH"

    RUN python -m venv /shopkeeper/venv
    COPY +pip-lockfile/requirements.txt .

    RUN pip install --no-cache-dir -r requirements.txt

    SAVE ARTIFACT venv

node-deps:
    FROM cgr.dev/chainguard/node:latest
    WORKDIR /shopkeeper

    COPY --chown=node:node package.json package-lock.json ./
    RUN npm install

    SAVE ARTIFACT node_modules

frontend:
    FROM cgr.dev/chainguard/node:latest
    WORKDIR /shopkeeper

    COPY +node-deps/node_modules ./node_modules

    COPY --chown=node:node package.json package-lock.json vite.config.ts tsconfig.json tsconfig.node.json ./
    COPY --chown=node:node frontend frontend
    RUN npm run build

    SAVE ARTIFACT --keep-ts frontend/dist

app:
    FROM cgr.dev/chainguard/python:latest
    WORKDIR /shopkeeper

    ENV PYTHONUNBUFFERED=1
    ENV PATH="/shopkeeper/venv/bin:$PATH"

    COPY +python-deps/venv /shopkeeper/venv
    COPY --keep-ts +frontend/dist /shopkeeper/frontend/dist
    COPY . .

    ENTRYPOINT ["python", "-m", "shopkeeper"]
    CMD ["start"]

    SAVE IMAGE --push ghcr.io/nint8835/shopkeeper:latest
