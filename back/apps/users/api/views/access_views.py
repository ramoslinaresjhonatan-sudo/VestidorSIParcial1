from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.users.api.pagination import StandardPagination
from apps.users.api.permissions import HasEndpointPermission
from apps.users.api.responses import success_response
from apps.users.api.serializers import (
    AccessOptionsSerializer,
    PermisoSerializer,
    RolCreateSerializer,
    RolSerializer,
    RolUpdateSerializer,
    UsuarioCreateSerializer,
    UsuarioSerializer,
    UsuarioUpdateSerializer,
)
from apps.users.application.use_cases import (
    AnnulUserUseCase,
    CreateRoleUseCase,
    CreateUserUseCase,
    DeleteUserUseCase,
    UpdateRoleUseCase,
    UpdateUserUseCase,
)
from apps.users.infrastructure.database.Repositori import (
    DjangoPermisoRepository,
    DjangoRolRepository,
    DjangoUsuarioRepository,
)


class UsuarioListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasEndpointPermission]
    permission_map = {
        "GET": "users.view_usuario",
        "POST": "users.add_usuario",
    }

    @extend_schema(responses=UsuarioSerializer(many=True))
    def get(self, request):
        usuarios = DjangoUsuarioRepository().list()
        paginator = StandardPagination()
        page = paginator.paginate_queryset(usuarios, request, view=self)
        return paginator.get_paginated_response(UsuarioSerializer(page, many=True).data)

    @extend_schema(request=UsuarioCreateSerializer, responses={201: UsuarioSerializer})
    def post(self, request):
        serializer = UsuarioCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        usuario = CreateUserUseCase(DjangoUsuarioRepository()).execute(
            serializer.validated_data
        )
        return success_response(
            UsuarioSerializer(usuario).data,
            "Usuario creado correctamente.",
            status.HTTP_201_CREATED,
        )


class UsuarioDetailView(APIView):
    permission_classes = [IsAuthenticated, HasEndpointPermission]
    permission_map = {
        "GET": "users.view_usuario",
        "PUT": "users.change_usuario",
        "PATCH": "users.change_usuario",
        "DELETE": "users.delete_usuario",
    }

    @extend_schema(responses=UsuarioSerializer)
    def get(self, request, usuario_id: int):
        usuario = DjangoUsuarioRepository().get(usuario_id)
        return success_response(UsuarioSerializer(usuario).data)

    def _update(self, request, usuario_id: int):
        serializer = UsuarioUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        usuario = UpdateUserUseCase(DjangoUsuarioRepository()).execute(
            usuario_id,
            serializer.validated_data,
        )
        return success_response(
            UsuarioSerializer(usuario).data,
            "Usuario actualizado correctamente.",
        )

    @extend_schema(request=UsuarioUpdateSerializer, responses=UsuarioSerializer)
    def put(self, request, usuario_id: int):
        return self._update(request, usuario_id)

    @extend_schema(request=UsuarioUpdateSerializer, responses=UsuarioSerializer)
    def patch(self, request, usuario_id: int):
        return self._update(request, usuario_id)

    @extend_schema(responses={200: None})
    def delete(self, request, usuario_id: int):
        DeleteUserUseCase(DjangoUsuarioRepository()).execute(usuario_id)
        return success_response(message="Usuario eliminado definitivamente.")


class UsuarioAnnulView(APIView):
    permission_classes = [IsAuthenticated, HasEndpointPermission]
    permission_map = {"POST": "users.change_usuario"}

    @extend_schema(request=None, responses=UsuarioSerializer)
    def post(self, request, usuario_id: int):
        usuario = AnnulUserUseCase(DjangoUsuarioRepository()).execute(usuario_id)
        return success_response(
            UsuarioSerializer(usuario).data,
            "Usuario anulado correctamente.",
        )


class RolListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasEndpointPermission]
    permission_map = {
        "GET": "auth.view_group",
        "POST": "auth.add_group",
    }

    @extend_schema(responses=RolSerializer(many=True))
    def get(self, request):
        roles = DjangoRolRepository().list()
        return success_response(RolSerializer(roles, many=True).data)

    @extend_schema(request=RolCreateSerializer, responses={201: RolSerializer})
    def post(self, request):
        serializer = RolCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        rol = CreateRoleUseCase(DjangoRolRepository()).execute(serializer.validated_data)
        return success_response(
            RolSerializer(rol).data,
            "Rol creado correctamente.",
            status.HTTP_201_CREATED,
        )


class RolDetailView(APIView):
    permission_classes = [IsAuthenticated, HasEndpointPermission]
    permission_map = {
        "GET": "auth.view_group",
        "PUT": "auth.change_group",
        "PATCH": "auth.change_group",
    }

    @extend_schema(responses=RolSerializer)
    def get(self, request, rol_id: int):
        rol = DjangoRolRepository().get(rol_id)
        return success_response(RolSerializer(rol).data)

    def _update(self, request, rol_id: int):
        serializer = RolUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        rol = UpdateRoleUseCase(DjangoRolRepository()).execute(
            rol_id,
            serializer.validated_data,
        )
        return success_response(
            RolSerializer(rol).data,
            "Rol y permisos actualizados correctamente.",
        )

    @extend_schema(request=RolUpdateSerializer, responses=RolSerializer)
    def put(self, request, rol_id: int):
        return self._update(request, rol_id)

    @extend_schema(request=RolUpdateSerializer, responses=RolSerializer)
    def patch(self, request, rol_id: int):
        return self._update(request, rol_id)


class PermisoListView(APIView):
    permission_classes = [IsAuthenticated, HasEndpointPermission]
    permission_map = {"GET": "auth.view_permission"}

    @extend_schema(responses=PermisoSerializer(many=True))
    def get(self, request):
        permisos = DjangoPermisoRepository().list()
        modulo = request.query_params.get("modulo")
        if modulo:
            permisos = [permiso for permiso in permisos if permiso.modulo == modulo]
        return success_response(PermisoSerializer(permisos, many=True).data)


class AccessOptionsView(APIView):
    """Catálogo combinado para los formularios de usuario y rol."""

    permission_classes = [IsAuthenticated, HasEndpointPermission]
    permission_map = {
        "GET": ("auth.view_group", "auth.view_permission"),
    }

    @extend_schema(responses=AccessOptionsSerializer)
    def get(self, request):
        roles = DjangoRolRepository().list()
        permisos = DjangoPermisoRepository().list()
        return success_response(
            {
                "roles": RolSerializer(roles, many=True).data,
                "permisos": PermisoSerializer(permisos, many=True).data,
            },
            "Opciones de acceso obtenidas correctamente.",
        )
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.users.api.pagination import StandardPagination
from apps.users.api.permissions import HasEndpointPermission
from apps.users.api.responses import success_response
from apps.users.api.serializers import (
    AccessOptionsSerializer,
    ClienteRegistroSerializer,
    PermisoSerializer,
    RolCreateSerializer,
    RolSerializer,
    RolUpdateSerializer,
    UsuarioCreateSerializer,
    UsuarioSerializer,
    UsuarioUpdateSerializer,
)
from apps.users.application.use_cases import (
    AnnulUserUseCase,
    CreateRoleUseCase,
    CreateUserUseCase,
    DeleteUserUseCase,
    RegisterClientUseCase,
    UpdateRoleUseCase,
    UpdateUserUseCase,
)
from apps.users.infrastructure.database.Repositori import (
    DjangoPermisoRepository,
    DjangoRolRepository,
    DjangoUsuarioRepository,
)


class UsuarioListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasEndpointPermission]
    permission_map = {
        "GET": "users.view_usuario",
        "POST": "users.add_usuario",
    }

    @extend_schema(responses=UsuarioSerializer(many=True))
    def get(self, request):
        usuarios = DjangoUsuarioRepository().list()
        paginator = StandardPagination()
        page = paginator.paginate_queryset(usuarios, request, view=self)
        return paginator.get_paginated_response(UsuarioSerializer(page, many=True).data)

    @extend_schema(request=UsuarioCreateSerializer, responses={201: UsuarioSerializer})
    def post(self, request):
        serializer = UsuarioCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        usuario = CreateUserUseCase(DjangoUsuarioRepository()).execute(
            serializer.validated_data
        )
        return success_response(
            UsuarioSerializer(usuario).data,
            "Usuario creado correctamente.",
            status.HTTP_201_CREATED,
        )


class UsuarioDetailView(APIView):
    permission_classes = [IsAuthenticated, HasEndpointPermission]
    permission_map = {
        "GET": "users.view_usuario",
        "PUT": "users.change_usuario",
        "PATCH": "users.change_usuario",
        "DELETE": "users.delete_usuario",
    }

    @extend_schema(responses=UsuarioSerializer)
    def get(self, request, usuario_id: int):
        usuario = DjangoUsuarioRepository().get(usuario_id)
        return success_response(UsuarioSerializer(usuario).data)

    def _update(self, request, usuario_id: int):
        serializer = UsuarioUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        usuario = UpdateUserUseCase(DjangoUsuarioRepository()).execute(
            usuario_id,
            serializer.validated_data,
        )
        return success_response(
            UsuarioSerializer(usuario).data,
            "Usuario actualizado correctamente.",
        )

    @extend_schema(request=UsuarioUpdateSerializer, responses=UsuarioSerializer)
    def put(self, request, usuario_id: int):
        return self._update(request, usuario_id)

    @extend_schema(request=UsuarioUpdateSerializer, responses=UsuarioSerializer)
    def patch(self, request, usuario_id: int):
        return self._update(request, usuario_id)

    @extend_schema(responses={200: None})
    def delete(self, request, usuario_id: int):
        DeleteUserUseCase(DjangoUsuarioRepository()).execute(usuario_id)
        return success_response(message="Usuario eliminado definitivamente.")


class UsuarioAnnulView(APIView):
    permission_classes = [IsAuthenticated, HasEndpointPermission]
    permission_map = {"POST": "users.change_usuario"}

    @extend_schema(request=None, responses=UsuarioSerializer)
    def post(self, request, usuario_id: int):
        usuario = AnnulUserUseCase(DjangoUsuarioRepository()).execute(usuario_id)
        return success_response(
            UsuarioSerializer(usuario).data,
            "Usuario anulado correctamente.",
        )


class RolListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasEndpointPermission]
    permission_map = {
        "GET": "auth.view_group",
        "POST": "auth.add_group",
    }

    @extend_schema(responses=RolSerializer(many=True))
    def get(self, request):
        roles = DjangoRolRepository().list()
        return success_response(RolSerializer(roles, many=True).data)

    @extend_schema(request=RolCreateSerializer, responses={201: RolSerializer})
    def post(self, request):
        serializer = RolCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        rol = CreateRoleUseCase(DjangoRolRepository()).execute(serializer.validated_data)
        return success_response(
            RolSerializer(rol).data,
            "Rol creado correctamente.",
            status.HTTP_201_CREATED,
        )


class RolDetailView(APIView):
    permission_classes = [IsAuthenticated, HasEndpointPermission]
    permission_map = {
        "GET": "auth.view_group",
        "PUT": "auth.change_group",
        "PATCH": "auth.change_group",
    }

    @extend_schema(responses=RolSerializer)
    def get(self, request, rol_id: int):
        rol = DjangoRolRepository().get(rol_id)
        return success_response(RolSerializer(rol).data)

    def _update(self, request, rol_id: int):
        serializer = RolUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        rol = UpdateRoleUseCase(DjangoRolRepository()).execute(
            rol_id,
            serializer.validated_data,
        )
        return success_response(
            RolSerializer(rol).data,
            "Rol y permisos actualizados correctamente.",
        )

    @extend_schema(request=RolUpdateSerializer, responses=RolSerializer)
    def put(self, request, rol_id: int):
        return self._update(request, rol_id)

    @extend_schema(request=RolUpdateSerializer, responses=RolSerializer)
    def patch(self, request, rol_id: int):
        return self._update(request, rol_id)


class PermisoListView(APIView):
    permission_classes = [IsAuthenticated, HasEndpointPermission]
    permission_map = {"GET": "auth.view_permission"}

    @extend_schema(responses=PermisoSerializer(many=True))
    def get(self, request):
        permisos = DjangoPermisoRepository().list()
        modulo = request.query_params.get("modulo")
        if modulo:
            permisos = [permiso for permiso in permisos if permiso.modulo == modulo]
        return success_response(PermisoSerializer(permisos, many=True).data)


class AccessOptionsView(APIView):
    """Catálogo combinado para los formularios de usuario y rol."""

    permission_classes = [IsAuthenticated, HasEndpointPermission]
    permission_map = {
        "GET": ("auth.view_group", "auth.view_permission"),
    }

    @extend_schema(responses=AccessOptionsSerializer)
    def get(self, request):
        roles = DjangoRolRepository().list()
        permisos = DjangoPermisoRepository().list()
        return success_response(
            {
                "roles": RolSerializer(roles, many=True).data,
                "permisos": PermisoSerializer(permisos, many=True).data,
            },
            "Opciones de acceso obtenidas correctamente.",
        )

class ClienteRegistroView(APIView):
    """
    Registro público de clientes.

    Este endpoint no requiere autenticación.
    """

    permission_classes = []

    @extend_schema(
        request=ClienteRegistroSerializer,
        responses={201: UsuarioSerializer},
    )
    def post(self, request):

        serializer = ClienteRegistroSerializer(
            data=request.data
        )

        serializer.is_valid(raise_exception=True)

        cliente = RegisterClientUseCase(
            DjangoUsuarioRepository()
        ).execute(
            serializer.validated_data
        )

        return success_response(
            UsuarioSerializer(cliente).data,
            "Cliente registrado correctamente.",
            status.HTTP_201_CREATED,
        )