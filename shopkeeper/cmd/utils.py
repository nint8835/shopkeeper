import asyncio
from collections.abc import Callable, Coroutine
from functools import wraps
from typing import Any


def async_command[**P, R](
    f: Callable[P, Coroutine[Any, Any, R]],
) -> Callable[P, R]:
    @wraps(f)
    def run_wrapper(*args: P.args, **kwargs: P.kwargs) -> Any:
        return asyncio.run(f(*args, **kwargs))

    return run_wrapper
