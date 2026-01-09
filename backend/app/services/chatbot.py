import os
import json
from openai import OpenAI
import google.generativeai as genai
from typing import List, Dict, Any, Literal
from pydantic import BaseModel

# 지원하는 AI 모델 타입
AIModel = Literal["gpt", "gemini"]

# secret.json 경로 캐싱
_secret_path = None

def get_secret_path():
    """secret.json 파일 경로를 반환합니다"""
    global _secret_path
    if _secret_path is None:
        current_file = os.path.abspath(__file__)
        backend_app_services = os.path.dirname(current_file)
        backend_app = os.path.dirname(backend_app_services)
        backend = os.path.dirname(backend_app)
        project_root = os.path.dirname(backend)
        _secret_path = os.path.join(project_root, 'secret.json')
    return _secret_path


def load_secrets() -> dict:
    """secret.json에서 API 키들을 로드합니다"""
    secret_path = get_secret_path()
    if not os.path.exists(secret_path):
        raise FileNotFoundError(f"secret.json not found at {secret_path}")
    with open(secret_path, 'r') as f:
        return json.load(f)


def get_openai_client():
    """OpenAI 클라이언트 반환"""
    secrets = load_secrets()
    api_key = secrets.get('openai_api_key')
    if not api_key:
        raise ValueError("OpenAI API key not found in secret.json")
    return OpenAI(api_key=api_key)


def get_gemini_client():
    """Gemini 클라이언트 반환"""
    secrets = load_secrets()
    api_key = secrets.get('googleai_api_key')
    if not api_key:
        raise ValueError("Google AI API key not found in secret.json")
    genai.configure(api_key=api_key)
    return genai.GenerativeModel('gemini-2.0-flash')


# ============ 데이터 모델 ============

class SentimentResult(BaseModel):
    """감정 분석 결과"""
    sentiment: str  # 'positive', 'neutral', 'negative'
    score: float
    keywords: List[str]


class IntentAnalysis(BaseModel):
    """대화 의도 분석 결과"""
    needs_product_recommendation: bool
    intent_type: str
    reason: str


class ProductRecommendation(BaseModel):
    """추천 상품 정보"""
    product_id: int
    name: str
    reason: str
    relevance_score: float


# ============ 키워드 기반 추천 필요 여부 판단 ============

def should_recommend_products(message: str) -> bool:
    """
    메시지에 추천 관련 키워드가 있으면 True 반환.
    AI 의도 분석보다 우선 적용됨.
    """
    message_lower = message.lower()
    
    # 추천 트리거 키워드
    recommendation_keywords = [
        '추천', '뭐 먹', '뭐먹', '간식', '밀키트', '과일', '채소', '고기', '육류',
        '해산물', '음료', '간편식', '야식', '아침', '점심', '저녁', '식사',
        '다이어트', '건강', '영양', '요리', '레시피', '반찬', '국', '찌개',
        '아이', '어린이', '유아', '이유식', '샐러드', '디저트', '빵',
        '뭐 살', '뭐살', '장보기', '식재료', '재료'
    ]
    
    for keyword in recommendation_keywords:
        if keyword in message_lower:
            return True
    
    return False


# ============ 의도 분석 ============

async def analyze_intent(message: str, model: AIModel = "gpt") -> IntentAnalysis:
    """사용자 메시지의 의도를 분석합니다."""
    
    # 키워드 기반 강제 판단 (AI보다 우선)
    if should_recommend_products(message):
        return IntentAnalysis(
            needs_product_recommendation=True,
            intent_type="product_inquiry",
            reason="추천 관련 키워드 감지"
        )
    
    prompt = f"""
다음 사용자 메시지를 분석하여 상품 추천이 필요한지 판단해주세요.

사용자 메시지: "{message}"

응답은 반드시 다음 JSON 형식으로만 작성해주세요:
{{
    "needs_product_recommendation": true 또는 false,
    "intent_type": "greeting" 또는 "casual_chat" 또는 "product_inquiry",
    "reason": "판단 이유"
}}

상품 추천이 필요한 경우: 음식, 식재료, 요리 관련 질문/추천 요청
상품 추천이 필요 없는 경우: 단순 인사, 감사, 일상 대화
"""
    
    try:
        if model == "gpt":
            client = get_openai_client()
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "의도 분석 전문가입니다. JSON으로만 응답하세요."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                response_format={"type": "json_object"}
            )
            result = json.loads(response.choices[0].message.content)
        else:
            client = get_gemini_client()
            response = client.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.3,
                    response_mime_type="application/json"
                )
            )
            result = json.loads(response.text)
        
        return IntentAnalysis(
            needs_product_recommendation=result['needs_product_recommendation'],
            intent_type=result['intent_type'],
            reason=result['reason']
        )
    except Exception as e:
        print(f"의도 분석 오류: {str(e)}")
        return IntentAnalysis(
            needs_product_recommendation=False,
            intent_type="casual_chat",
            reason="분석 오류"
        )


# ============ 감정 분석 ============

async def analyze_sentiment(message: str, model: AIModel = "gpt") -> SentimentResult:
    """사용자 메시지의 감정을 분석합니다."""
    
    prompt = f"""
다음 메시지의 감정을 분석하고 키워드를 추출해주세요.

메시지: "{message}"

응답은 반드시 다음 JSON 형식으로만 작성해주세요:
{{
    "sentiment": "positive" 또는 "neutral" 또는 "negative",
    "score": 0.0에서 1.0 사이의 숫자,
    "keywords": ["키워드1", "키워드2", ...]
}}
"""
    
    try:
        if model == "gpt":
            client = get_openai_client()
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "감정 분석 전문가입니다. JSON으로만 응답하세요."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                response_format={"type": "json_object"}
            )
            result = json.loads(response.choices[0].message.content)
        else:
            client = get_gemini_client()
            response = client.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.3,
                    response_mime_type="application/json"
                )
            )
            result = json.loads(response.text)
        
        return SentimentResult(
            sentiment=result['sentiment'],
            score=result['score'],
            keywords=result['keywords']
        )
    except Exception as e:
        print(f"감정 분석 오류: {str(e)}")
        return SentimentResult(
            sentiment="neutral",
            score=0.5,
            keywords=message.split()[:3]
        )


# ============ 상품 추천 ============

async def recommend_products(
    message: str,
    sentiment_result: SentimentResult,
    user_profile: Dict[str, Any],
    all_products: List[Dict[str, Any]],
    purchase_history: List[Dict[str, Any]] = [],
    model: AIModel = "gpt"
) -> List[ProductRecommendation]:
    """
    사용자 메시지와 프로필 기반으로 상품을 추천합니다.
    
    로직:
    1. 프로필 필터링 (targetAge, targetGender)
    2. 키워드 매칭 상품 우선 배치
    3. AI가 최종 3~5개 선택
    """
    
    print(f"🎯 상품 추천 시작: {message}")
    
    message_lower = message.lower()
    gender = user_profile.get('gender', 'U')
    age_group = user_profile.get('ageGroup', '')
    
    # 키워드 매칭 상품 분리
    keyword_matched = []
    other_products = []
    
    for product in all_products:
        # 프로필 필터링
        target_gender = product.get('targetGender', 'all')
        target_ages = product.get('targetAge', [])
        
        gender_match = (
            target_gender == 'all' or
            (gender == 'M' and target_gender in ['male', 'male-oriented']) or
            (gender == 'F' and target_gender in ['female', 'female-oriented']) or
            target_gender == 'unisex'
        )
        age_match = not target_ages or age_group in target_ages
        
        if not (gender_match and age_match):
            continue
        
        # 키워드 매칭 체크
        name_lower = product['name'].lower()
        category_lower = product.get('category', '').lower()
        
        is_match = False
        if '밀키트' in message_lower and ('밀키트' in name_lower or '밀키트' in category_lower):
            is_match = True
        elif '간편식' in message_lower and ('간편식' in name_lower or '간편식' in category_lower):
            is_match = True
        elif '과일' in message_lower and ('과일' in name_lower or '과일' in category_lower):
            is_match = True
        elif '채소' in message_lower and ('채소' in name_lower or '채소' in category_lower):
            is_match = True
        elif ('고기' in message_lower or '육류' in message_lower) and ('고기' in name_lower or '육류' in category_lower):
            is_match = True
        elif '해산물' in message_lower and ('해산물' in name_lower or '해산물' in category_lower):
            is_match = True
        elif '음료' in message_lower and ('음료' in name_lower or '음료' in category_lower):
            is_match = True
        elif '간식' in message_lower and ('간식' in name_lower or '스낵' in category_lower or '과자' in category_lower):
            is_match = True
        
        if is_match:
            keyword_matched.append(product)
        else:
            other_products.append(product)
    
    # 키워드 매칭 우선 + 나머지
    products_to_send = keyword_matched[:50] + other_products[:30]
    
    print(f"   키워드 매칭: {len(keyword_matched)}개, 기타: {len(other_products)}개")
    print(f"   AI에 전달: {len(products_to_send)}개")
    
    # AI 프롬프트 구성
    simplified_products = [
        {
            "id": p['id'],
            "name": p['name'],
            "category": p['category'],
            "description": p.get('description', ''),
            "price": p.get('price', 0)
        }
        for p in products_to_send
    ]
    
    prompt = f"""
사용자 정보:
- 성별: {gender}
- 연령대: {age_group}
- 메시지: "{message}"
- 키워드: {', '.join(sentiment_result.keywords)}

추천 가능한 상품 목록:
{json.dumps(simplified_products, ensure_ascii=False, indent=2)}

사용자의 요청에 가장 적합한 **완제품 상품** 3~5개를 추천하세요.

**중요**:
- "밀키트 추천" → 상품명에 [밀키트]가 있는 완제품 선택 (재료 X)
- "과일 추천" → 과일 카테고리 상품 선택
- 사용자는 바로 먹을 수 있는 상품을 원합니다

응답 형식 (JSON만):
{{
    "recommendations": [
        {{
            "product_id": 상품ID(숫자),
            "reason": "추천 이유 (한 문장)",
            "relevance_score": 0.0~1.0
        }}
    ]
}}
"""
    
    try:
        if model == "gpt":
            client = get_openai_client()
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "식재료 추천 전문가입니다. JSON으로만 응답하세요."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                response_format={"type": "json_object"}
            )
            result = json.loads(response.choices[0].message.content)
        else:
            client = get_gemini_client()
            response = client.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.7,
                    response_mime_type="application/json"
                )
            )
            result = json.loads(response.text)
        
        recommendations = []
        for rec in result.get('recommendations', []):
            product_id = rec['product_id']
            product = next((p for p in all_products if p['id'] == product_id), None)
            if product:
                recommendations.append(ProductRecommendation(
                    product_id=product_id,
                    name=product['name'],
                    reason=rec['reason'],
                    relevance_score=rec.get('relevance_score', 0.8)
                ))
        
        # 최소 3개 보장
        if len(recommendations) < 3:
            fallback = sorted(keyword_matched + other_products, key=lambda x: x.get('reviews', 0), reverse=True)
            for p in fallback:
                if len(recommendations) >= 3:
                    break
                if p['id'] not in [r.product_id for r in recommendations]:
                    recommendations.append(ProductRecommendation(
                        product_id=p['id'],
                        name=p['name'],
                        reason="인기 상품입니다.",
                        relevance_score=0.7
                    ))
        
        print(f"✅ 추천 완료: {[r.name for r in recommendations[:5]]}")
        return recommendations[:5]
        
    except Exception as e:
        print(f"❌ 추천 오류: {str(e)}")
        # 폴백: 인기 상품
        fallback = sorted(keyword_matched + other_products, key=lambda x: x.get('reviews', 0), reverse=True)[:3]
        return [
            ProductRecommendation(
                product_id=p['id'],
                name=p['name'],
                reason="인기 상품입니다.",
                relevance_score=0.6
            )
            for p in fallback
        ]


# ============ 일반 대화 응답 ============

async def generate_casual_response(
    message: str,
    sentiment_result: SentimentResult,
    intent_analysis: IntentAnalysis,
    user_profile: Dict[str, Any],
    model: AIModel = "gpt"
) -> str:
    """상품 추천 없이 일반 대화 응답을 생성합니다."""
    
    user_name = user_profile.get('name', '고객')
    
    prompt = f"""
당신은 친근한 FreshMind AI 쇼핑 도우미입니다.

사용자: {user_name}님
메시지: "{message}"
감정: {sentiment_result.sentiment}

다음 지침에 따라 응답하세요:
- 인사에는 친근하게 답변
- 일상 대화에는 공감하며 대화
- 필요시 "음식이나 식재료 관련해서 도와드릴게요!" 안내
- 이모지 적절히 사용
- 2-3문장으로 간결하게

응답만 작성 (JSON 아님):
"""
    
    try:
        if model == "gpt":
            client = get_openai_client()
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "친근한 쇼핑 도우미입니다."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.8
            )
            return response.choices[0].message.content.strip()
        else:
            client = get_gemini_client()
            response = client.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(temperature=0.8)
            )
            return response.text.strip()
    except Exception as e:
        print(f"응답 생성 오류: {str(e)}")
        return f"안녕하세요, {user_name}님! 😊 무엇을 도와드릴까요? 음식이나 식재료 관련해서 추천해드릴 수 있어요!"
