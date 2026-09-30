from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache

class Settings(BaseSettings):
    DATABASE_URL: str = 'sqlite:///./mmw.db'
    ADMIN_PASSWORD: str
    SECRET_KEY: str
    ALGORITHM: str = 'HS256'
    PUBLIC_BASE_URL: str = 'https://maxmoc.com'
    QR_PROVIDER: str = 'local_test'
    ME_QR_API_TOKEN: str = ''
    SELLER_STATE_CODE: str = '33'
    DEFAULT_GST_RATE: float = 18.0
    STORAGE_DIR: str = './storage_data'
    TEMPLATE_DIR: str = './templates'
    FONT_DIR: str = './fonts'
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480
    CORS_ORIGINS: str = 'http://localhost:5173'

    model_config = SettingsConfigDict(env_file='.env', env_file_encoding='utf-8')

@lru_cache()
def get_settings() -> Settings:
    return Settings()
