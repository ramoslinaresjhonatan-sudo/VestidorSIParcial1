"""Configuración para desarrollo local."""

import os

from .base import *  # noqa: F403

DEBUG = os.getenv("DEBUG", "True").lower() in {"1", "true", "yes", "on"}
