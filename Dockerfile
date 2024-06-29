FROM cgr.dev/chainguard/python:latest-dev as builder

ENV LANG=C.UTF-8
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PATH="/shopkeeper/venv/bin:$PATH"

WORKDIR /shopkeeper

RUN python -m venv /shopkeeper/venv
COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

FROM cgr.dev/chainguard/node:latest as frontend-builder

WORKDIR /shopkeeper

COPY --chown=node:node package.json package-lock.json ./
RUN npm install

COPY --chown=node:node postcss.config.js tailwind.config.js vite.config.ts tsconfig.json tsconfig.node.json ./
COPY --chown=node:node frontend frontend
RUN npm run build

FROM cgr.dev/chainguard/python:latest

ENV PYTHONUNBUFFERED=1
ENV PATH="/shopkeeper/venv/bin:$PATH"

WORKDIR /shopkeeper

COPY --from=builder /shopkeeper/venv /shopkeeper/venv
COPY --from=frontend-builder /shopkeeper/frontend/dist /shopkeeper/frontend/dist
COPY . .

ENTRYPOINT ["python", "-m", "shopkeeper"]
