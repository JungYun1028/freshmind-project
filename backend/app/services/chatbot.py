import os
import json
from openai import OpenAI
from typing import List, Dict, Any
from pydantic import BaseModel

# OpenAI 클라이언트 초기화
def get_openai_client():
    """secret.json에서 OpenAI API 키를 로드하고 클라이언트 반환"""
    try:
        # secret.json 파일에서 API 키 읽기 (프로젝트 루트)
        # backend/app/services/chatbot.py -> backend/ -> freshmind-project/
        current_file = os.path.abspath(__file__)
        backend_app_services = os.path.dirname(current_file)  # backend/app/services
        backend_app = os.path.dirname(backend_app_services)    # backend/app
        backend = os.path.dirname(backend_app)                  # backend
        project_root = os.path.dirname(backend)                 # freshmind-project
        secret_path = os.path.join(project_root, 'secret.json')
        
        print(f"🔍 Looking for secret.json at: {secret_path}")
        
        if not os.path.exists(secret_path):
            raise FileNotFoundError(f"secret.json not found at {secret_path}")
        
        with open(secret_path, 'r') as f:
            secrets = json.load(f)
        
        api_key = secrets.get('openai_api_key')
        if not api_key:
            raise ValueError("OpenAI API key not found in secret.json")
        
        print(f"✅ OpenAI API key loaded successfully")
        return OpenAI(api_key=api_key)
    except Exception as e:
        print(f"❌ Failed to load OpenAI client: {str(e)}")
        raise Exception(f"Failed to load OpenAI client: {str(e)}")


class SentimentResult(BaseModel):
    """감정 분석 결과"""
    sentiment: str  # 'positive', 'neutral', 'negative'
    score: float  # 0.0 ~ 1.0
    keywords: List[str]  # 추출된 키워드들


class ProductRecommendation(BaseModel):
    """추천 상품 정보"""
    product_id: int
    name: str
    reason: str  # 추천 이유
    relevance_score: float  # 관련도 점수


async def analyze_sentiment(message: str) -> SentimentResult:
    """
    사용자 메시지의 감정을 분석합니다.
    
    Args:
        message: 사용자 메시지
        
    Returns:
        SentimentResult: 감정 분석 결과 (sentiment, score, keywords)
    """
    client = get_openai_client()
    
    prompt = f"""
다음 사용자 메시지의 감정을 분석하고 키워드를 추출해주세요.

사용자 메시지: "{message}"

응답은 반드시 다음 JSON 형식으로만 작성해주세요:
{{
    "sentiment": "positive" 또는 "neutral" 또는 "negative",
    "score": 0.0에서 1.0 사이의 숫자,
    "keywords": ["키워드1", "키워드2", ...]
}}

감정 분류 기준:
- positive: 기쁨, 만족, 관심, 기대감 등 긍정적인 감정
- neutral: 단순 질문, 정보 요청 등 중립적인 감정
- negative: 불만, 걱정, 불편함 등 부정적인 감정

키워드는 상품 검색에 사용될 핵심 단어들을 추출해주세요.
"""
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "당신은 감정 분석 전문가입니다. JSON 형식으로만 응답하세요."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            response_format={"type": "json_object"}
        )
        
        result = json.loads(response.choices[0].message.content)
        
        return SentimentResult(
            sentiment=result['sentiment'],
            score=result['score'],
            keywords=result['keywords']
        )
    except Exception as e:
        print(f"감정 분석 오류: {str(e)}")
        # 기본값 반환
        return SentimentResult(
            sentiment="neutral",
            score=0.5,
            keywords=message.split()[:3]  # 처음 3단어를 키워드로
        )


async def recommend_products(
    message: str,
    sentiment_result: SentimentResult,
    user_profile: Dict[str, Any],
    all_products: List[Dict[str, Any]]
) -> List[ProductRecommendation]:
    """
    사용자 메시지, 감정 분석 결과, 프로필 기반으로 상품을 추천합니다.
    
    Args:
        message: 사용자 메시지
        sentiment_result: 감정 분석 결과
        user_profile: 사용자 프로필 (gender, ageGroup 등)
        all_products: 전체 상품 목록
        
    Returns:
        List[ProductRecommendation]: 추천 상품 목록 (3-5개)
    """
    client = get_openai_client()
    
    # 상품 목록을 간략화 (ID, 이름, 카테고리, 설명만)
    simplified_products = [
        {
            "id": p['id'],
            "name": p['name'],
            "category": p['category'],
            "description": p.get('description', ''),
            "targetAge": p.get('targetAge', []),
            "targetGender": p.get('targetGender', 'all'),
            "usedIn": p.get('usedIn', []),
            "tags": p.get('tags', [])
        }
        for p in all_products[:50]  # GPT 토큰 제한 고려하여 50개만
    ]
    
    prompt = f"""
사용자 정보:
- 성별: {user_profile.get('gender', 'unknown')}
- 연령대: {user_profile.get('ageGroup', 'unknown')}
- 메시지: "{message}"
- 감정: {sentiment_result.sentiment} (점수: {sentiment_result.score})
- 키워드: {', '.join(sentiment_result.keywords)}

상품 목록:
{json.dumps(simplified_products, ensure_ascii=False, indent=2)}

위 정보를 바탕으로 사용자에게 가장 적합한 상품 3-5개를 추천하고, 각 상품마다 추천 이유를 설명해주세요.

응답은 반드시 다음 JSON 형식으로만 작성해주세요:
{{
    "recommendations": [
        {{
            "product_id": 상품ID(숫자),
            "reason": "추천 이유 (한 문장)",
            "relevance_score": 관련도 점수 (0.0~1.0)
        }}
    ]
}}

추천 기준:
1. 사용자의 연령대와 성별에 맞는 상품
2. 메시지 키워드와 관련된 상품
3. 감정 상태에 맞는 상품 (예: positive → 프리미엄/건강식품)
4. 상품의 targetAge, targetGender, usedIn, tags 고려
"""
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "당신은 식재료 전문 추천 시스템입니다. JSON 형식으로만 응답하세요."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            response_format={"type": "json_object"}
        )
        
        result = json.loads(response.choices[0].message.content)
        recommendations = []
        
        for rec in result['recommendations']:
            product_id = rec['product_id']
            # 해당 상품 찾기
            product = next((p for p in all_products if p['id'] == product_id), None)
            
            if product:
                recommendations.append(ProductRecommendation(
                    product_id=product_id,
                    name=product['name'],
                    reason=rec['reason'],
                    relevance_score=rec.get('relevance_score', 0.8)
                ))
        
        return recommendations[:5]  # 최대 5개
        
    except Exception as e:
        print(f"상품 추천 오류: {str(e)}")
        # 기본 추천 (인기 상품 3개)
        popular_products = sorted(all_products, key=lambda x: x.get('reviews', 0), reverse=True)[:3]
        return [
            ProductRecommendation(
                product_id=p['id'],
                name=p['name'],
                reason="인기 많은 상품입니다",
                relevance_score=0.6
            )
            for p in popular_products
        ]

