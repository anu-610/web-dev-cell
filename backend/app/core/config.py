from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # PostgreSQL
    POSTGRES_DB: str = "webdevcell"
    POSTGRES_USER: str = "wdc_admin"
    POSTGRES_PASSWORD: str = "changeme"
    POSTGRES_HOST: str = "db"
    POSTGRES_PORT: int = 5432

    # Supabase — used only for JWT verification
    SUPABASE_JWT_SECRET: str = "your-jwt-secret"

    # CORS
    FRONTEND_URL: str = "http://localhost:5173"

    model_config = SettingsConfigDict(env_file="../.env", extra="ignore")

    @property
    def database_url(self) -> str:
        return (
            f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    @property
    def sync_database_url(self) -> str:
        """Used by Alembic (sync driver)."""
        return (
            f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )


settings = Settings()
