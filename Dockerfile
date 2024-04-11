FROM cgr.dev/chainguard/python:latest-dev as builder

ENV LANG=C.UTF-8
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PATH="/shopkeeper/venv/bin:$PATH"

WORKDIR /shopkeeper

RUN python -m venv /shopkeeper/venv
COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

FROM cgr.dev/chainguard/python:latest-dev

ENV PYTHONUNBUFFERED=1
ENV PATH="/shopkeeper/venv/bin:$PATH"

WORKDIR /shopkeeper

COPY --from=builder /shopkeeper/venv /shopkeeper/venv
COPY . .

ENTRYPOINT ["python", "-m", "shopkeeper"]
