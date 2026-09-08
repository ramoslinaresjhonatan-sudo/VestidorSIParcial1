# Diagrama de contexto

```mermaid
flowchart LR
    SA[Superadministrador] -->|planes y suscripciones| S[Sistema SaaS]
    AI[Administrador institucional] -->|usuarios, roles y permisos| S
    U[Usuario] -->|credenciales| S
    S -->|sesión y funciones autorizadas| U
    S -->|estado de suscripción| SA
```
