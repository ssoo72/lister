from sqlalchemy import Column, Integer, String, Text, Date, Boolean, DateTime
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class Company(Base):
    """エントリーした企業の情報を管理するモデル"""
    __tablename__ = "companies"
    
    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String(200), nullable=False, index=True)  # 企業名
    industry = Column(String(100))  # 業界
    job_type = Column(String(100))  # 職種
    
    # 選考状況
    status = Column(String(50), default="エントリー済み")  # エントリー済み、書類選考中、面接中、内定、不合格
    
    # ES・面接情報
    es_deadline = Column(Date)  # ES締切
    es_submitted = Column(Boolean, default=False)  # ES提出済み
    interview_count = Column(Integer, default=0)  # 面接回数
    next_interview_date = Column(DateTime)  # 次の面接日時
    
    # 企業情報
    website_url = Column(String(500))  # 企業サイトURL
    recruit_url = Column(String(500))  # 採用サイトURL
    mypage_id = Column(String(200))  # マイページID（ログインID・受験番号など）
    mypage_password = Column(String(200))  # マイページパスワード
    salary = Column(String(100))  # 初任給
    location = Column(String(200))  # 勤務地
    
    # メモ
    notes = Column(Text)  # 企業についてのメモ
    interview_notes = Column(Text)  # 面接メモ
    
    # 志望度
    priority = Column(Integer, default=3)  # 1(高) ~ 5(低)
    
    # タイムスタンプ
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<Company(id={self.id}, name={self.company_name}, status={self.status})>"
