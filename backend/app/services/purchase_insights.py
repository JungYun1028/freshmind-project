"""
구매이력 기반 인사이트 분석 서비스
"""
from datetime import datetime, timedelta
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.models import PurchaseHistory, Product, User


def calculate_time_weight(purchased_at: datetime) -> float:
    """시간 가중치 계산"""
    now = datetime.now()
    days_ago = (now - purchased_at).days
    
    if days_ago <= 7:
        return 1.5  # 최근 1주일
    elif days_ago <= 30:
        return 1.2  # 최근 1개월
    elif days_ago <= 90:
        return 1.0  # 최근 3개월
    else:
        return 0.7  # 그 이전


def calculate_repeat_bonus(purchase_count: int) -> float:
    """반복 구매 보너스 계산"""
    if purchase_count >= 6:
        return 2.0
    elif purchase_count >= 4:
        return 1.5
    elif purchase_count >= 2:
        return 1.3
    else:
        return 1.0


def calculate_quantity_weight(quantity: int) -> float:
    """수량 가중치 계산"""
    if quantity >= 4:
        return 1.5
    elif quantity >= 2:
        return 1.2
    else:
        return 1.0


def get_purchase_summary(db: Session, user_id: int, period_days: int = 30) -> Dict[str, Any]:
    """
    사용자의 구매 요약 정보 반환
    
    Args:
        db: 데이터베이스 세션
        user_id: 사용자 ID
        period_days: 분석 기간 (일)
    
    Returns:
        구매 요약 정보 딕셔너리
    """
    # 사용자 정보 조회
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        return None
    
    # 기간 설정
    start_date = datetime.now() - timedelta(days=period_days)
    
    # 구매이력 조회 (최근 period_days일)
    purchases = db.query(
        PurchaseHistory,
        Product
    ).join(
        Product, PurchaseHistory.product_id == Product.product_id
    ).filter(
        PurchaseHistory.user_id == user_id,
        PurchaseHistory.purchased_at >= start_date
    ).all()
    
    if not purchases:
        return {
            "user_id": user_id,
            "user_name": user.name,
            "period": f"last_{period_days}_days",
            "total_purchases": 0,
            "insights": {
                "top_products": [],
                "recent_trends": [],
                "repeat_purchases": [],
                "category_preferences": {}
            },
            "message_template_id": 0,
            "message_variables": {}
        }
    
    # 상품별 구매 통계 계산
    product_stats: Dict[int, Dict[str, Any]] = {}
    
    for purchase_history, product in purchases:
        product_id = product.product_id
        
        if product_id not in product_stats:
            product_stats[product_id] = {
                "product_id": product_id,
                "product_name": product.name,
                "category": product.category,
                "purchase_count": 0,
                "total_quantity": 0,
                "weighted_score": 0.0,
                "purchase_dates": [],
                "last_purchased": None
            }
        
        stats = product_stats[product_id]
        stats["purchase_count"] += 1
        stats["total_quantity"] += purchase_history.quantity
        stats["purchase_dates"].append(purchase_history.purchased_at)
        
        # 가중치 점수 계산
        time_weight = calculate_time_weight(purchase_history.purchased_at)
        quantity_weight = calculate_quantity_weight(purchase_history.quantity)
        base_score = 1.0
        
        stats["weighted_score"] += base_score * time_weight * quantity_weight
        
        # 마지막 구매일 업데이트
        if not stats["last_purchased"] or purchase_history.purchased_at > stats["last_purchased"]:
            stats["last_purchased"] = purchase_history.purchased_at
    
    # 반복 구매 보너스 적용
    for product_id, stats in product_stats.items():
        repeat_bonus = calculate_repeat_bonus(stats["purchase_count"])
        stats["weighted_score"] *= repeat_bonus
    
    # 가중치 점수 기준으로 정렬
    sorted_products = sorted(
        product_stats.values(),
        key=lambda x: x["weighted_score"],
        reverse=True
    )
    
    # Top 3 상품
    top_products = sorted_products[:3]
    
    # 반복 구매 상품 (3회 이상)
    repeat_purchases = [
        p for p in sorted_products 
        if p["purchase_count"] >= 3
    ][:3]
    
    # 카테고리 선호도 계산
    category_preferences: Dict[str, float] = {}
    total_score = sum(p["weighted_score"] for p in sorted_products)
    
    for product in sorted_products:
        category = product["category"] or "기타"
        if category not in category_preferences:
            category_preferences[category] = 0.0
        category_preferences[category] += product["weighted_score"] / total_score if total_score > 0 else 0
    
    # 최근 트렌드 (최근 1주일)
    week_ago = datetime.now() - timedelta(days=7)
    recent_purchases = [
        p for p in sorted_products
        if p["last_purchased"] and p["last_purchased"] >= week_ago
    ][:3]
    
    # 메시지 변수 생성
    top_product_names = [p["product_name"] for p in top_products[:3]]
    message_variables = {
        "count": len(purchases),
        "products": ", ".join(top_product_names),
        "most_purchased": top_products[0]["product_name"] if top_products else "",
        "repeat_count": repeat_purchases[0]["purchase_count"] if repeat_purchases else 0,
        "top_category": max(category_preferences.items(), key=lambda x: x[1])[0] if category_preferences else ""
    }
    
    return {
        "user_id": user_id,
        "user_name": user.name,
        "period": f"last_{period_days}_days",
        "total_purchases": len(purchases),
        "insights": {
            "top_products": [
                {
                    "product_id": p["product_id"],
                    "product_name": p["product_name"],
                    "purchase_count": p["purchase_count"],
                    "weighted_score": round(p["weighted_score"], 2),
                    "last_purchased": p["last_purchased"].isoformat() if p["last_purchased"] else None
                }
                for p in top_products
            ],
            "recent_trends": [
                {
                    "product_id": p["product_id"],
                    "product_name": p["product_name"],
                    "purchase_count": p["purchase_count"],
                    "last_purchased": p["last_purchased"].isoformat() if p["last_purchased"] else None
                }
                for p in recent_purchases
            ],
            "repeat_purchases": [
                {
                    "product_id": p["product_id"],
                    "product_name": p["product_name"],
                    "repeat_count": p["purchase_count"]
                }
                for p in repeat_purchases
            ],
            "category_preferences": category_preferences
        },
        "message_template_id": 0,  # 프론트엔드에서 랜덤 선택
        "message_variables": message_variables
    }

