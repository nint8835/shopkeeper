import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.routing import APIRoute
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.responses import Response
from starlette.staticfiles import StaticFiles
from starlette.types import Scope

from shopkeeper.bot import client
from shopkeeper.config import config
from shopkeeper.web.routers import listings_router


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

app.include_router(listings_router, prefix="/api/listings")
app.mount(
    "/", SPAStaticFiles(directory="shopkeeper/web/frontend/dist", html=True), "frontend"
)


__all__ = ["app"]
