from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from app.services.chatbot import analyze_sentiment, recommend_products

router = APIRouter()


class ChatRequest(BaseModel):
    """챗봇 요청 데이터"""
    message: str
    user_profile: Optional[Dict[str, Any]] = None
    products: List[Dict[str, Any]]  # 프론트엔드에서 전달받은 상품 목록


class ChatResponse(BaseModel):
    """챗봇 응답 데이터"""
    message: str  # AI 응답 메시지
    sentiment: str  # 'positive', 'neutral', 'negative'
    sentiment_score: float
    keywords: List[str]
    recommended_products: List[Dict[str, Any]]  # 추천 상품들


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    사용자 메시지를 받아 감정 분석 후 상품을 추천합니다.
    
    - **message**: 사용자가 입력한 메시지
    - **user_profile**: 사용자 프로필 (gender, ageGroup 등)
    - **products**: 전체 상품 목록
    """
    try:
        # 1. 감정 분석
        sentiment_result = await analyze_sentiment(request.message)
        
        # 2. 상품 추천
        user_profile = request.user_profile or {}
        recommendations = await recommend_products(
            message=request.message,
            sentiment_result=sentiment_result,
            user_profile=user_profile,
            all_products=request.products
        )
        
        # 3. AI 응답 메시지 생성
        response_message = generate_response_message(
            sentiment=sentiment_result.sentiment,
            recommendations=recommendations
        )
        
        # 4. 추천 상품 상세 정보 구성
        recommended_products_detail = []
        for rec in recommendations:
            # 원본 상품 정보 찾기
            product = next((p for p in request.products if p['id'] == rec.product_id), None)
            if product:
                recommended_products_detail.append({
                    "id": rec.product_id,
                    "name": rec.name,
                    "reason": rec.reason,
                    "relevance_score": rec.relevance_score,
                    "price": product.get('price'),
                    "image": product.get('image'),
                    "rating": product.get('rating'),
                    "reviews": product.get('reviews'),
                    "category": product.get('category')
                })
        
        return ChatResponse(
            message=response_message,
            sentiment=sentiment_result.sentiment,
            sentiment_score=sentiment_result.score,
            keywords=sentiment_result.keywords,
            recommended_products=recommended_products_detail
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"챗봇 처리 중 오류 발생: {str(e)}")


def generate_response_message(sentiment: str, recommendations: List[Any]) -> str:
    """AI 응답 메시지 생성"""
    if sentiment == "positive":
        greeting = "좋은 선택이에요! 😊"
    elif sentiment == "negative":
        greeting = "걱정 마세요, 제가 도와드릴게요."
    else:
        greeting = "알겠습니다!"
    
    if len(recommendations) > 0:
        return f"{greeting} 고객님께 딱 맞는 상품 {len(recommendations)}개를 추천드려요."
    else:
        return f"{greeting} 죄송하지만 현재 적합한 상품을 찾지 못했어요."


@router.get("/health")
async def health_check():
    """챗봇 API 상태 확인"""
    return {"status": "healthy", "service": "chatbot"}

