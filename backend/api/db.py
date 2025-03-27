import os
from dotenv import load_dotenv
from pathlib import Path
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base

# プロジェクトのルートディレクトリへの絶対パスを取得
backend_dir = Path(__file__).resolve().parent.parent
dotenv_path = backend_dir / ".env.python"

load_dotenv(dotenv_path)

ASYNC_DB_URL = os.environ["DATABASE_URL"]


async_engine = create_async_engine(ASYNC_DB_URL, echo=True)

async_session = sessionmaker(
    autocommit=False, autoflush=False, bind=async_engine, class_=AsyncSession
)

Base = declarative_base()


async def get_db():
    async with async_session() as session:
        yield session
