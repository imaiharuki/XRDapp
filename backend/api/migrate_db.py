import asyncio
from sqlalchemy import create_engine
from pathlib import Path
from dotenv import load_dotenv
import os

from models.XRDDataModel import Base

DB_URL = "postgresql+psycopg2://imaiharuki:kklab@db:5432/xrd"


engine = create_engine(DB_URL, echo=True)


def reset_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


if __name__ == "__main__":
    reset_database()
