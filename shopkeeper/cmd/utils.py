import asyncio
from functools import wraps
from typing import Any, Callable, Coroutine, ParamSpec, TypeVar

R = TypeVar("R")
P = ParamSpec("P")


def async_command(f: Callable[P, Coroutine[R, None, None]]) -> Callable[P, R]:
    @wraps(f)
    def run_wrapper(*args: P.args, **kwargs: P.kwargs) -> Any:
        return asyncio.run(f(*args, **kwargs))

    return run_wrapper
