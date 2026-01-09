from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from app.services.chatbot import (
    analyze_intent,
    analyze_sentiment,
    recommend_products,
    generate_casual_response
)

router = APIRouter()


class ChatRequest(BaseModel):
    """챗봇 요청 데이터"""
    message: str
    user_profile: Optional[Dict[str, Any]] = None
    products: List[Dict[str, Any]]  # 프론트엔드에서 전달받은 상품 목록
    purchase_history: Optional[List[Dict[str, Any]]] = []  # 구매이력 데이터 (신규)


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
    사용자 메시지를 받아 의도를 파악하고, 필요시에만 상품을 추천합니다.
    
    - **message**: 사용자가 입력한 메시지
    - **user_profile**: 사용자 프로필 (gender, ageGroup 등)
    - **products**: 전체 상품 목록
    """
    try:
        user_profile = request.user_profile or {}
        
        # 1. 의도 분석 (상품 추천이 필요한가?)
        intent_analysis = await analyze_intent(request.message)
        print(f"🔍 의도 분석: {intent_analysis.intent_type}, 상품 추천 필요: {intent_analysis.needs_product_recommendation}")
        
        # 2. 감정 분석
        sentiment_result = await analyze_sentiment(request.message)
        print(f"💭 감정: {sentiment_result.sentiment} ({sentiment_result.score})")
        
        recommended_products_detail = []
        response_message = ""
        
        # 3. 상품 추천이 필요한 경우에만 추천 실행
        if intent_analysis.needs_product_recommendation:
            print("✅ 상품 추천 실행")
            recommendations = await recommend_products(
                message=request.message,
                sentiment_result=sentiment_result,
                user_profile=user_profile,
                all_products=request.products,
                purchase_history=request.purchase_history or []  # 구매이력 전달
            )
            
            # 추천 상품 상세 정보 구성
            for rec in recommendations:
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
            
            # 상품 추천 응답 메시지
            response_message = generate_response_message(
                sentiment=sentiment_result.sentiment,
                recommendations=recommendations,
                user_name=user_profile.get('name', '고객')
            )
        else:
            print("ℹ️  일반 대화 응답 생성")
            # 일반 대화 응답
            response_message = await generate_casual_response(
                message=request.message,
                sentiment_result=sentiment_result,
                intent_analysis=intent_analysis,
                user_profile=user_profile
            )
        
        return ChatResponse(
            message=response_message,
            sentiment=sentiment_result.sentiment,
            sentiment_score=sentiment_result.score,
            keywords=sentiment_result.keywords,
            recommended_products=recommended_products_detail
        )
        
    except Exception as e:
        print(f"❌ 챗봇 오류: {str(e)}")
        raise HTTPException(status_code=500, detail=f"챗봇 처리 중 오류 발생: {str(e)}")


def generate_response_message(sentiment: str, recommendations: List[Any], user_name: str = "고객") -> str:
    """상품 추천 시 AI 응답 메시지 생성"""
    if sentiment == "positive":
        greeting = f"{user_name}님, 좋은 선택이에요! 😊"
    elif sentiment == "negative":
        greeting = f"{user_name}님, 걱정 마세요. 제가 도와드릴게요."
    else:
        greeting = f"{user_name}님,"
    
    if len(recommendations) > 0:
        return f"{greeting} 고객님께 딱 맞는 상품 {len(recommendations)}개를 골라봤어요. 한번 살펴보시겠어요?"
    else:
        return f"{greeting} 아쉽지만 지금은 딱 맞는 상품을 찾지 못했어요. 다른 키워드로 다시 물어봐주시겠어요?"


@router.get("/health")
async def health_check():
    """챗봇 API 상태 확인"""
    return {"status": "healthy", "service": "chatbot"}

