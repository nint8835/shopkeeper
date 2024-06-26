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

COPY --chown=node:node . .
RUN npm install && npm run build

FROM cgr.dev/chainguard/python:latest

ENV PYTHONUNBUFFERED=1
ENV PATH="/shopkeeper/venv/bin:$PATH"

WORKDIR /shopkeeper

COPY --from=builder /shopkeeper/venv /shopkeeper/venv
COPY --from=frontend-builder /shopkeeper/shopkeeper/web/frontend/dist /shopkeeper/shopkeeper/web/frontend/dist
COPY . .

ENTRYPOINT ["python", "-m", "shopkeeper"]
