class UserService:
    """Normalización reutilizable de datos de entrada."""

    @staticmethod
    def normalize_email(email: str) -> str:
        return email.strip().lower()

    @staticmethod
    def normalize_text(value: str) -> str:
        return " ".join(value.strip().split())
