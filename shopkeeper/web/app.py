import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.routing import APIRoute
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.middleware.sessions import SessionMiddleware
from starlette.responses import Response
from starlette.staticfiles import StaticFiles
from starlette.types import Scope

from shopkeeper.bot import client
from shopkeeper.config import config
from shopkeeper.web.routers import auth_router, listings_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    asyncio.create_task(client.start(config.token))

    yield

    await client.close()


class SPAStaticFiles(StaticFiles):
    async def get_response(self, path: str, scope: Scope) -> Response:
        try:
            return await super().get_response(path, scope)
        except StarletteHTTPException as exc:
            if exc.status_code == 404:
                return await super().get_response("index.html", scope)
            else:
                raise exc


def generate_unique_id(route: APIRoute) -> str:
    return route.name


app = FastAPI(
    title="Shopkeeper",
    lifespan=lifespan,
    generate_unique_id_function=generate_unique_id,
)

app.add_middleware(SessionMiddleware, secret_key=config.session_secret)

app.include_router(listings_router, prefix="/api/listings")
app.include_router(auth_router, prefix="/auth")

app.mount("/", SPAStaticFiles(directory="frontend/dist", html=True), "frontend")


__all__ = ["app"]
