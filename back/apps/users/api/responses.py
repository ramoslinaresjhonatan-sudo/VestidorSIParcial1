from typing import Any

from rest_framework import status
from rest_framework.response import Response


def success_response(
    data: Any = None,
    message: str = "Operación realizada correctamente.",
    status_code: int = status.HTTP_200_OK,
) -> Response:
    return Response(
        {"success": True, "message": message, "data": data},
        status=status_code,
    )
