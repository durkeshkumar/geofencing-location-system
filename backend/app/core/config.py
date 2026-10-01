from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "Geofencing & Location Event Detection System"
    APP_VERSION: str = "1.0.0"

    DATABASE_URL: str

    MAX_GPS_ACCURACY: float = 50.0

    class Config:
        env_file = ".env"


settings = Settings()