from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str
    AZURE_OPENAI_ENDPOINT: str
    AZURE_OPENAI_API_KEY: str
    AZURE_OPENAI_DEPLOYMENT: str
    AZURE_OPENAI_API_VERSION: str
    SECRET_KEY: str

    class Config:
        env_file = ".env"


settings = Settings()