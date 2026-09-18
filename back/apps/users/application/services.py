class UserService:
    """Normalización reutilizable de datos de entrada."""

    @staticmethod
    def normalize_email(email: str) -> str:
        return email.strip().lower()

    @staticmethod
    def normalize_text(value: str) -> str:
        return " ".join(value.strip().split())

    @staticmethod
    def suggest_size(medida_pecho=None, medida_cintura=None) -> str:
        """Sugiere talla basada en pecho/cintura. Retorna '' si no hay datos."""
        ref = None
        if medida_pecho is not None:
            try:
                ref = float(medida_pecho)
            except (TypeError, ValueError):
                pass
        if ref is None and medida_cintura is not None:
            try:
                ref = float(medida_cintura)
            except (TypeError, ValueError):
                pass
        if ref is None:
            return ""
        if ref < 86:
            return "XS"
        if ref < 92:
            return "S"
        if ref < 98:
            return "M"
        if ref < 104:
            return "L"
        if ref < 110:
            return "XL"
        return "XXL"
