import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.routing import APIRoute
from fastapi_utils.tasks import repeat_every
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.middleware.sessions import SessionMiddleware
from starlette.responses import Response
from starlette.staticfiles import StaticFiles
from starlette.templating import Jinja2Templates
from starlette.types import Scope

from shopkeeper.bot import client, guild
from shopkeeper.config import config
from shopkeeper.web.routers import auth_router, listing_images_router, listings_router
from shopkeeper.web.tasks import send_reminders

templates = Jinja2Templates(directory="shopkeeper/web/templates")


@repeat_every(seconds=config.reminder_interval, wait_first=config.reminder_interval)
async def run_background_tasks():
    await send_reminders()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await client.login(config.token)
    if config.init_on_startup:
        await client.tree.sync(guild=guild)

    asyncio.create_task(client.connect())
    await run_background_tasks()

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


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: HTTPException) -> Response:
    accept = request.headers.get("accept", "")
    if "text/html" not in accept:
        return JSONResponse({"detail": exc.detail}, status_code=exc.status_code)

    return templates.TemplateResponse(
        request=request,
        name="error.html",
        context={"detail": exc.detail},
        status_code=exc.status_code,
    )


app.add_middleware(SessionMiddleware, secret_key=config.session_secret)

app.include_router(listings_router, prefix="/api/listings")
app.include_router(auth_router, prefix="/auth")
app.include_router(listing_images_router, prefix="/images")

app.mount("/", SPAStaticFiles(directory="frontend/dist", html=True), "frontend")


__all__ = ["app"]
