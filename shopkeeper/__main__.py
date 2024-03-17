from .bot import client
from .config import config
from .features import *  # noqa: F401

client.run(config.token)
