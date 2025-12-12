from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from datetime import datetime, date
from contextlib import asynccontextmanager

import crud
import models
from database import get_db, init_db
from ai_service import ai_service

# データベース初期化用のライフサイクル管理
@asynccontextmanager
async def lifespan(app: FastAPI):
    # 起動時
    init_db()
    yield
    # 終了時の処理（必要であれば）

# FastAPIアプリの初期化
app = FastAPI(title="就活管理API", version="1.0.0", lifespan=lifespan)

# CORS設定（Next.jsからのアクセスを許可）
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "https://*.onrender.com",  # Render deployment
    ],
    allow_origin_regex=r"https://.*\.onrender\.com",  # Renderのサブドメインを許可
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydanticスキーマ
class CompanyBase(BaseModel):
    company_name: str
    industry: Optional[str] = None
    job_type: Optional[str] = None
    status: str = "エントリー済み"
    es_deadline: Optional[date] = None
    es_submitted: bool = False
    interview_count: int = 0
    next_interview_date: Optional[datetime] = None
    website_url: Optional[str] = None
    recruit_url: Optional[str] = None
    mypage_id: Optional[str] = None
    mypage_password: Optional[str] = None
    salary: Optional[str] = None
    location: Optional[str] = None
    notes: Optional[str] = None
    interview_notes: Optional[str] = None
    priority: int = 3

class CompanyCreate(CompanyBase):
    pass

class CompanyUpdate(BaseModel):
    company_name: Optional[str] = None
    industry: Optional[str] = None
    job_type: Optional[str] = None
    status: Optional[str] = None
    es_deadline: Optional[date] = None
    es_submitted: Optional[bool] = None
    interview_count: Optional[int] = None
    next_interview_date: Optional[datetime] = None
    website_url: Optional[str] = None
    recruit_url: Optional[str] = None
    mypage_id: Optional[str] = None
    mypage_password: Optional[str] = None
    salary: Optional[str] = None
    location: Optional[str] = None
    notes: Optional[str] = None
    interview_notes: Optional[str] = None
    priority: Optional[int] = None

class CompanyResponse(CompanyBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

# APIエンドポイント
@app.get("/")
def read_root():
    return {
        "message": "就活管理API",
        "version": "1.0.0",
        "status": "running",
        "docs": "http://localhost:8000/docs"
    }

@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    """ヘルスチェック - APIとデータベースの接続状態を確認"""
    try:
        # データベース接続テスト
        db.execute("SELECT 1")
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    return {
        "status": "healthy",
        "api": "running",
        "database": db_status,
        "timestamp": datetime.utcnow().isoformat()
    }

@app.post("/companies/", response_model=CompanyResponse, status_code=201)
def create_company(company: CompanyCreate, db: Session = Depends(get_db)):
    """企業を新規登録"""
    return crud.create_company(db, company.model_dump())

@app.get("/companies/", response_model=List[CompanyResponse])
def read_companies(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    industry: Optional[str] = None,
    priority: Optional[int] = None,
    sort_by: str = "created_at",
    order: str = "desc",
    db: Session = Depends(get_db)
):
    """企業一覧を取得"""
    companies = crud.get_companies(
        db, skip=skip, limit=limit,
        status=status, industry=industry, priority=priority,
        sort_by=sort_by, order=order
    )
    return companies

@app.get("/companies/search/")
def search_companies(keyword: str, db: Session = Depends(get_db)):
    """企業名で検索"""
    companies = crud.search_companies(db, keyword)
    return companies

@app.get("/companies/{company_id}", response_model=CompanyResponse)
def read_company(company_id: int, db: Session = Depends(get_db)):
    """特定の企業情報を取得"""
    company = crud.get_company(db, company_id)
    if company is None:
        raise HTTPException(status_code=404, detail="企業が見つかりません")
    return company

@app.put("/companies/{company_id}", response_model=CompanyResponse)
def update_company(company_id: int, company: CompanyUpdate, db: Session = Depends(get_db)):
    """企業情報を更新"""
    updated_company = crud.update_company(
        db, company_id, company.model_dump(exclude_unset=True)
    )
    if updated_company is None:
        raise HTTPException(status_code=404, detail="企業が見つかりません")
    return updated_company

@app.delete("/companies/{company_id}", status_code=204)
def delete_company(company_id: int, db: Session = Depends(get_db)):
    """企業を削除"""
    success = crud.delete_company(db, company_id)
    if not success:
        raise HTTPException(status_code=404, detail="企業が見つかりません")
    return None

@app.get("/statistics/")
def get_statistics(db: Session = Depends(get_db)):
    """統計情報を取得"""
    return crud.get_statistics(db)

# AI による企業情報自動取得エンドポイント
class AICompanyInfoRequest(BaseModel):
    company_name: str

class AICompanyInfoResponse(BaseModel):
    industry: Optional[str] = None
    job_type: Optional[str] = None
    location: Optional[str] = None
    salary: Optional[str] = None
    website_url: Optional[str] = None
    error: Optional[str] = None

@app.post("/ai/company-info/", response_model=AICompanyInfoResponse)
async def get_ai_company_info(request: AICompanyInfoRequest):
    """
    AI を使って企業名から業界、職種などの情報を自動取得
    Google Gemini API（無料）を使用
    """
    if not ai_service.is_available():
        return AICompanyInfoResponse(
            error="AI サービスが利用できません。backend/.env に GEMINI_API_KEY を設定してください。"
        )
    
    company_info = await ai_service.get_company_info(request.company_name)
    return AICompanyInfoResponse(**company_info)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
