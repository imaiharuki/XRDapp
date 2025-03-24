import os
from dotenv import load_dotenv
from pathlib import Path

# プロジェクトのルートディレクトリへの絶対パスを取得
backend_dir = Path(__file__).resolve().parent.parent
dotenv_path = backend_dir / ".env.python"

load_dotenv(dotenv_path)

ASYNC_DB_URL = os.environ["DATABASE_URL"]

print(ASYNC_DB_URL)
