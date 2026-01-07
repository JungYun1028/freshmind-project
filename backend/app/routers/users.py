"""
사용자 관련 API 엔드포인트
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any
from app.database import get_db
from app.services.purchase_insights import get_purchase_summary

router = APIRouter()


@router.get("/{user_id}/purchase-summary")
async def get_user_purchase_summary(
    user_id: int,
    period_days: int = 30,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    사용자의 구매 요약 정보 조회
    
    Args:
        user_id: 사용자 ID
        period_days: 분석 기간 (일, 기본값: 30)
        db: 데이터베이스 세션
    
    Returns:
        구매 요약 정보
    """
    try:
        summary = get_purchase_summary(db, user_id, period_days)
        
        if summary is None:
            raise HTTPException(status_code=404, detail="User not found")
        
        return summary
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching purchase summary: {str(e)}")

