from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from models import Base
import os

# SQLiteのURL（絶対パスで指定）
DB_PATH = os.path.join(os.path.dirname(__file__), "job_hunting.db")
DATABASE_URL = f"sqlite:///{DB_PATH}"

# エンジンの作成
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}  # SQLite用
)

# セッションの作成
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# テーブルの作成
def init_db():
    Base.metadata.create_all(bind=engine)

# 依存性注入用
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
