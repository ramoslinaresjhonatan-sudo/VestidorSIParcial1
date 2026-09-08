"""Configuración segura para producción."""

import os

from django.core.exceptions import ImproperlyConfigured

from .base import *  # noqa: F403

DEBUG = False

if SECRET_KEY == "django-insecure-development-only":  # noqa: F405
    raise ImproperlyConfigured("SECRET_KEY debe definirse en producción.")

if os.getenv("DB_ENGINE", "").lower() not in {"postgres", "postgresql"}:
    raise ImproperlyConfigured("Producción requiere DB_ENGINE=postgresql.")

SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_HSTS_SECONDS = 31_536_000
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
