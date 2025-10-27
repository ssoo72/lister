from sqlalchemy.orm import Session
from sqlalchemy import desc, asc
from typing import List, Optional
from datetime import datetime
import models

# Create
def create_company(db: Session, company_data: dict) -> models.Company:
    """新しい企業を作成"""
    db_company = models.Company(**company_data)
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    return db_company

# Read
def get_company(db: Session, company_id: int) -> Optional[models.Company]:
    """IDで企業を取得"""
    return db.query(models.Company).filter(models.Company.id == company_id).first()

def get_companies(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    industry: Optional[str] = None,
    priority: Optional[int] = None,
    sort_by: str = "created_at",
    order: str = "desc"
) -> List[models.Company]:
    """企業一覧を取得（フィルタリング・ソート対応）"""
    query = db.query(models.Company)
    
    # フィルタリング
    if status:
        query = query.filter(models.Company.status == status)
    if industry:
        query = query.filter(models.Company.industry == industry)
    if priority:
        query = query.filter(models.Company.priority == priority)
    
    # ソート
    if order == "asc":
        query = query.order_by(asc(getattr(models.Company, sort_by)))
    else:
        query = query.order_by(desc(getattr(models.Company, sort_by)))
    
    return query.offset(skip).limit(limit).all()

def search_companies(db: Session, keyword: str) -> List[models.Company]:
    """企業名で検索"""
    return db.query(models.Company).filter(
        models.Company.company_name.contains(keyword)
    ).all()

# Update
def update_company(db: Session, company_id: int, company_data: dict) -> Optional[models.Company]:
    """企業情報を更新"""
    db_company = get_company(db, company_id)
    if db_company:
        for key, value in company_data.items():
            if hasattr(db_company, key):
                setattr(db_company, key, value)
        db_company.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_company)
    return db_company

# Delete
def delete_company(db: Session, company_id: int) -> bool:
    """企業を削除"""
    db_company = get_company(db, company_id)
    if db_company:
        db.delete(db_company)
        db.commit()
        return True
    return False

# Statistics
def get_statistics(db: Session) -> dict:
    """統計情報を取得"""
    total = db.query(models.Company).count()
    by_status = {}
    statuses = ["エントリー済み", "書類選考中", "面接中", "内定", "不合格"]
    for status in statuses:
        count = db.query(models.Company).filter(models.Company.status == status).count()
        by_status[status] = count
    
    return {
        "total": total,
        "by_status": by_status
    }
