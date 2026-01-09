import os
import json
from openai import OpenAI
import google.generativeai as genai
from typing import List, Dict, Any, Literal
from pydantic import BaseModel
from datetime import datetime, timedelta
from collections import Counter

# 지원하는 AI 모델 타입
AIModel = Literal["gpt", "gemini"]

# secret.json 경로 캐싱
_secret_path = None

def get_secret_path():
    """secret.json 파일 경로를 반환합니다"""
    global _secret_path
    if _secret_path is None:
        current_file = os.path.abspath(__file__)
        backend_app_services = os.path.dirname(current_file)  # backend/app/services
        backend_app = os.path.dirname(backend_app_services)    # backend/app
        backend = os.path.dirname(backend_app)                  # backend
        project_root = os.path.dirname(backend)                 # freshmind-project
        _secret_path = os.path.join(project_root, 'secret.json')
    return _secret_path


def load_secrets() -> dict:
    """secret.json에서 API 키들을 로드합니다"""
    secret_path = get_secret_path()
    print(f"🔍 Looking for secret.json at: {secret_path}")
    
    if not os.path.exists(secret_path):
        raise FileNotFoundError(f"secret.json not found at {secret_path}")
    
    with open(secret_path, 'r') as f:
        return json.load(f)


# OpenAI 클라이언트 초기화
def get_openai_client():
    """secret.json에서 OpenAI API 키를 로드하고 클라이언트 반환"""
    try:
        secrets = load_secrets()
        api_key = secrets.get('openai_api_key')
        if not api_key:
            raise ValueError("OpenAI API key not found in secret.json")
        
        print(f"✅ OpenAI API key loaded successfully")
        return OpenAI(api_key=api_key)
    except Exception as e:
        print(f"❌ Failed to load OpenAI client: {str(e)}")
        raise Exception(f"Failed to load OpenAI client: {str(e)}")


# Gemini 클라이언트 초기화
def get_gemini_client():
    """secret.json에서 Google AI API 키를 로드하고 Gemini 설정"""
    try:
        secrets = load_secrets()
        api_key = secrets.get('googleai_api_key')
        if not api_key:
            raise ValueError("Google AI API key not found in secret.json")
        
        genai.configure(api_key=api_key)
        print(f"✅ Gemini API key loaded successfully")
        return genai.GenerativeModel('gemini-1.5-flash')
    except Exception as e:
        print(f"❌ Failed to load Gemini client: {str(e)}")
        raise Exception(f"Failed to load Gemini client: {str(e)}")


class SentimentResult(BaseModel):
    """감정 분석 결과"""
    sentiment: str  # 'positive', 'neutral', 'negative'
    score: float  # 0.0 ~ 1.0
    keywords: List[str]  # 추출된 키워드들


class IntentAnalysis(BaseModel):
    """대화 의도 분석 결과"""
    needs_product_recommendation: bool  # 상품 추천이 필요한가?
    intent_type: str  # 'greeting', 'question', 'product_inquiry', 'casual_chat', etc.
    reason: str  # 판단 이유


class ProductRecommendation(BaseModel):
    """추천 상품 정보"""
    product_id: int
    name: str
    reason: str  # 추천 이유
    relevance_score: float  # 관련도 점수


def analyze_purchase_history(purchase_history: List[Dict[str, Any]], all_products: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    구매이력을 분석하여 사용자의 구매 패턴을 파악합니다.
    
    Returns:
        {
            'purchased_product_ids': [1, 2, 3, ...],  # 구매한 상품 ID
            'purchase_counts': {1: 3, 2: 2, ...},      # 상품별 구매 횟수
            'recent_categories': ['간편식', '밀키트'],  # 최근 구매 카테고리
            'top_categories': ['간편식', '밀키트'],     # 자주 구매하는 카테고리
            'recent_purchase_date': '2025-12-29',     # 가장 최근 구매일
        }
    """
    if not purchase_history:
        return {
            'purchased_product_ids': [],
            'purchase_counts': {},
            'recent_categories': [],
            'top_categories': [],
            'recent_purchase_date': None
        }
    
    # 상품 ID별 구매 횟수
    purchase_counts = Counter([p['productId'] for p in purchase_history])
    purchased_product_ids = list(purchase_counts.keys())
    
    # 최근 구매 날짜 (가장 최근)
    sorted_history = sorted(purchase_history, key=lambda x: x['purchasedAt'], reverse=True)
    recent_purchase_date = sorted_history[0]['purchasedAt'][:10] if sorted_history else None
    
    # 최근 1개월 구매 상품 (카테고리 파악용)
    one_month_ago = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
    recent_purchases = [p for p in sorted_history if p['purchasedAt'][:10] >= one_month_ago]
    
    # 최근 구매 카테고리
    recent_product_ids = [p['productId'] for p in recent_purchases]
    recent_categories = []
    for prod_id in recent_product_ids:
        product = next((p for p in all_products if p['id'] == prod_id), None)
        if product:
            recent_categories.append(product['category'])
    recent_categories = list(set(recent_categories))  # 중복 제거
    
    # 전체 구매에서 자주 구매하는 카테고리 (TOP 3)
    all_categories = []
    for prod_id in purchased_product_ids:
        product = next((p for p in all_products if p['id'] == prod_id), None)
        if product:
            all_categories.append(product['category'])
    
    category_counts = Counter(all_categories)
    top_categories = [cat for cat, _ in category_counts.most_common(3)]
    
    return {
        'purchased_product_ids': purchased_product_ids,
        'purchase_counts': dict(purchase_counts),
        'recent_categories': recent_categories,
        'top_categories': top_categories,
        'recent_purchase_date': recent_purchase_date
    }


def calculate_purchase_history_score(product: Dict[str, Any], purchase_analysis: Dict[str, Any]) -> float:
    """
    구매이력 기반 점수 계산
    
    ① 반복 구매 상품: 60 + (구매횟수 × 5)
    ② 최근 구매 카테고리: 40 + (최근 1개월 내면 +20)
    ③ 최근 구매 카테고리의 미구매 상품: 30 + (최근 1개월 +15, 2개월 +10)
    ④ 미구매 상품 중 선호 카테고리: 20
    """
    product_id = product['id']
    category = product['category']
    
    purchased_ids = purchase_analysis['purchased_product_ids']
    purchase_counts = purchase_analysis['purchase_counts']
    recent_categories = purchase_analysis['recent_categories']
    top_categories = purchase_analysis['top_categories']
    
    # ① 반복 구매 상품 (최고 우선순위)
    if product_id in purchased_ids:
        count = purchase_counts.get(product_id, 0)
        return 60 + (count * 5)
    
    # ② 최근 구매 카테고리
    if category in recent_categories:
        return 40 + 20  # 최근 1개월 내 구매한 카테고리
    
    # ③ 최근 구매 카테고리의 미구매 상품
    if category in recent_categories:
        return 30 + 15  # 최근 1개월
    
    # ④ 미구매 상품 중 선호 카테고리
    if category in top_categories:
        return 20
    
    return 0


def calculate_profile_score(product: Dict[str, Any], user_profile: Dict[str, Any]) -> float:
    """
    프로필 기반 점수 계산
    
    - 연령대 매칭: 30점
    - 성별 매칭: 20점
    - 카테고리 보너스: 15점 (50% 반영 = 7.5점)
    """
    score = 0
    
    age_group = user_profile.get('ageGroup', '')
    gender = user_profile.get('gender', '')
    
    # 연령대 매칭 (30점)
    target_ages = product.get('targetAge', [])
    if age_group in target_ages:
        score += 30
    
    # 성별 매칭 (20점)
    target_gender = product.get('targetGender', 'all')
    if target_gender == 'all':
        score += 20
    elif gender == 'M' and target_gender in ['male', 'male-oriented']:
        score += 20
    elif gender == 'F' and target_gender in ['female', 'female-oriented']:
        score += 20
    
    # 카테고리 보너스 (15점의 50% = 7.5점)
    # 간단하게 주요 카테고리에 보너스
    category = product.get('category', '')
    if category in ['간편식/밀키트', '과일', '채소']:
        score += 7.5
    
    return score


def calculate_popularity_score(product: Dict[str, Any]) -> float:
    """
    인기도 점수 계산 (최대 10점)
    
    - 리뷰 수 기반: min((reviews / 2000) × 10, 10)
    """
    reviews = product.get('reviews', 0)
    return min((reviews / 2000) * 10, 10)


def calculate_personalized_score(
    product: Dict[str, Any],
    purchase_analysis: Dict[str, Any],
    user_profile: Dict[str, Any]
) -> float:
    """
    통합 추천 점수 계산
    
    최종 점수 = 구매이력 점수(50%) + 프로필 점수(30%) + 인기도 점수(10%)
    """
    # 1. 구매이력 점수 (50%)
    purchase_score = calculate_purchase_history_score(product, purchase_analysis)
    weighted_purchase = purchase_score * 0.5
    
    # 2. 프로필 점수 (30%)
    profile_score = calculate_profile_score(product, user_profile)
    weighted_profile = profile_score * 0.3
    
    # 3. 인기도 점수 (10%)
    popularity_score = calculate_popularity_score(product)
    weighted_popularity = popularity_score * 0.1
    
    # 최종 점수
    total_score = weighted_purchase + weighted_profile + weighted_popularity
    
    return total_score


async def analyze_intent(message: str, model: AIModel = "gpt") -> IntentAnalysis:
    """
    사용자 메시지의 의도를 분석하여 상품 추천이 필요한지 판단합니다.
    
    Args:
        message: 사용자 메시지
        model: 사용할 AI 모델 ("gpt" 또는 "gemini")
        
    Returns:
        IntentAnalysis: 의도 분석 결과
    """
    
    prompt = f"""
다음 사용자 메시지를 분석하여 상품 추천이 필요한지 판단해주세요.

사용자 메시지: "{message}"

응답은 반드시 다음 JSON 형식으로만 작성해주세요:
{{
    "needs_product_recommendation": true 또는 false,
    "intent_type": "greeting" 또는 "casual_chat" 또는 "product_inquiry" 또는 "recipe_question" 또는 "complaint",
    "reason": "판단 이유를 한 문장으로"
}}

상품 추천이 필요한 경우 (needs_product_recommendation: true):
- 식재료, 음식, 요리에 대해 구체적으로 질문하거나 추천을 요청하는 경우
- "뭐 먹을까?", "간식 추천", "아이 음식", "다이어트 식품" 등
- 특정 요리를 만들고 싶다고 하거나 재료를 찾는 경우
- 건강, 영양, 식단에 대한 고민이나 질문

상품 추천이 필요 없는 경우 (needs_product_recommendation: false):
- 단순 인사: "안녕", "안녕하세요", "hi", "hello"
- 감사 표현: "고마워", "감사합니다"
- 일반 대화: "오늘 날씨 좋네", "잘 지내?"
- 챗봇에 대한 질문: "너는 누구야?", "뭐 할 수 있어?"
- 불만/컴플레인 (상품 추천보다는 공감과 위로 필요)

intent_type 분류:
- greeting: 인사, 감사
- casual_chat: 일상 대화
- product_inquiry: 상품 관련 질문/추천 요청
- recipe_question: 요리법 질문
- complaint: 불만, 컴플레인
"""
    
    try:
        if model == "gpt":
            client = get_openai_client()
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "당신은 사용자의 의도를 정확히 파악하는 전문가입니다. JSON 형식으로만 응답하세요."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                response_format={"type": "json_object"}
            )
            result = json.loads(response.choices[0].message.content)
        else:  # gemini
            client = get_gemini_client()
            response = client.generate_content(
                f"당신은 사용자의 의도를 정확히 파악하는 전문가입니다. JSON 형식으로만 응답하세요.\n\n{prompt}",
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
        # 기본값: 안전하게 추천하지 않음
        return IntentAnalysis(
            needs_product_recommendation=False,
            intent_type="casual_chat",
            reason="분석 오류로 기본값 반환"
        )


async def analyze_sentiment(message: str, model: AIModel = "gpt") -> SentimentResult:
    """
    사용자 메시지의 감정을 분석합니다.
    
    Args:
        message: 사용자 메시지
        model: 사용할 AI 모델 ("gpt" 또는 "gemini")
        
    Returns:
        SentimentResult: 감정 분석 결과 (sentiment, score, keywords)
    """
    
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
        if model == "gpt":
            client = get_openai_client()
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
        else:  # gemini
            client = get_gemini_client()
            response = client.generate_content(
                f"당신은 감정 분석 전문가입니다. JSON 형식으로만 응답하세요.\n\n{prompt}",
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
    all_products: List[Dict[str, Any]],
    purchase_history: List[Dict[str, Any]] = [],
    model: AIModel = "gpt"
) -> List[ProductRecommendation]:
    """
    사용자 메시지, 감정 분석 결과, 프로필, 구매이력 기반으로 상품을 추천합니다.
    
    Args:
        message: 사용자 메시지
        sentiment_result: 감정 분석 결과
        user_profile: 사용자 프로필 (gender, ageGroup 등)
        all_products: 전체 상품 목록
        purchase_history: 구매이력 (신규)
        model: 사용할 AI 모델 ("gpt" 또는 "gemini")
        
    Returns:
        List[ProductRecommendation]: 추천 상품 목록 (3-5개)
    """
    
    # 구매이력 분석
    purchase_analysis = analyze_purchase_history(purchase_history, all_products)
    print(f"📊 구매이력 분석: 구매 상품 {len(purchase_analysis['purchased_product_ids'])}개, "
          f"최근 카테고리 {purchase_analysis['recent_categories']}")
    
    # 1단계: 모든 상품에 대해 통합 점수 계산
    scored_products = []
    for product in all_products:
        score = calculate_personalized_score(product, purchase_analysis, user_profile)
        scored_products.append({
            'product': product,
            'score': score
        })
    
    # 2단계: 점수 순으로 정렬하여 상위 30개만 GPT에게 전달 (토큰 절약)
    scored_products.sort(key=lambda x: x['score'], reverse=True)
    top_products = [sp['product'] for sp in scored_products[:30]]
    
    print(f"🎯 상위 30개 상품 선정 완료 (최고 점수: {scored_products[0]['score']:.2f})")
    
    # 상품 목록을 간략화 (GPT에게 전달용)
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
        for p in top_products
    ]
    
    # 구매이력 정보 요약
    purchase_summary = ""
    if purchase_analysis['purchased_product_ids']:
        purchased_names = []
        for prod_id in purchase_analysis['purchased_product_ids'][:5]:  # 최대 5개만
            product = next((p for p in all_products if p['id'] == prod_id), None)
            if product:
                count = purchase_analysis['purchase_counts'].get(prod_id, 1)
                purchased_names.append(f"{product['name']} ({count}회)")
        purchase_summary = f"\n- 최근 구매 상품: {', '.join(purchased_names)}\n- 선호 카테고리: {', '.join(purchase_analysis['top_categories'])}"
    
    prompt = f"""
사용자 정보:
- 성별: {user_profile.get('gender', 'unknown')}
- 연령대: {user_profile.get('ageGroup', 'unknown')}
- 메시지: "{message}"
- 감정: {sentiment_result.sentiment} (점수: {sentiment_result.score})
- 키워드: {', '.join(sentiment_result.keywords)}{purchase_summary}

추천 후보 상품 (구매이력 & 프로필 기반 상위 30개):
{json.dumps(simplified_products, ensure_ascii=False, indent=2)}

위 정보를 바탕으로 사용자에게 가장 적합한 상품을 **3~5개** 추천하고, 각 상품마다 추천 이유를 설명해주세요.

응답은 반드시 다음 JSON 형식으로만 작성해주세요:
{{
    "recommendations": [
        {{
            "product_id": 상품ID(숫자),
            "reason": "추천 이유 (한 문장, 구매이력 고려)",
            "relevance_score": 관련도 점수 (0.0~1.0)
        }}
    ]
}}

추천 기준 (우선순위):
1. 사용자의 구매이력 (반복 구매 상품, 선호 카테고리)
2. 메시지 키워드와 관련된 상품
3. 감정 상태에 맞는 상품
4. 연령대와 성별 매칭

중요: 추천 개수는 최소 3개, 최대 5개로 제한하세요.
"""
    
    try:
        if model == "gpt":
            client = get_openai_client()
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
        else:  # gemini
            client = get_gemini_client()
            response = client.generate_content(
                f"당신은 식재료 전문 추천 시스템입니다. JSON 형식으로만 응답하세요.\n\n{prompt}",
                generation_config=genai.types.GenerationConfig(
                    temperature=0.7,
                    response_mime_type="application/json"
                )
            )
            result = json.loads(response.text)
        
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
        
        # 최소 3개, 최대 5개 제한
        if len(recommendations) < 3:
            print(f"⚠️  추천 상품이 {len(recommendations)}개뿐입니다. 상위 상품으로 보완합니다.")
            # 상위 점수 상품으로 보완
            for sp in scored_products[:5]:
                if len(recommendations) >= 3:
                    break
                product = sp['product']
                if product['id'] not in [r.product_id for r in recommendations]:
                    recommendations.append(ProductRecommendation(
                        product_id=product['id'],
                        name=product['name'],
                        reason="구매이력 기반 추천 상품입니다",
                        relevance_score=0.7
                    ))
        
        return recommendations[:5]  # 최대 5개
        
    except Exception as e:
        print(f"❌ 상품 추천 오류: {str(e)}")
        # 기본 추천: 구매이력 기반 상위 3개
        print("📦 구매이력 기반 기본 추천으로 대체합니다")
        return [
            ProductRecommendation(
                product_id=sp['product']['id'],
                name=sp['product']['name'],
                reason="구매이력 기반 추천 상품입니다",
                relevance_score=0.7
            )
            for sp in scored_products[:3]
        ]


async def generate_casual_response(
    message: str,
    sentiment_result: SentimentResult,
    intent_analysis: IntentAnalysis,
    user_profile: Dict[str, Any],
    model: AIModel = "gpt"
) -> str:
    """
    상품 추천 없이 일반 대화 응답을 생성합니다.
    
    Args:
        message: 사용자 메시지
        sentiment_result: 감정 분석 결과
        intent_analysis: 의도 분석 결과
        user_profile: 사용자 프로필
        model: 사용할 AI 모델 ("gpt" 또는 "gemini")
        
    Returns:
        str: AI 응답 메시지
    """
    
    user_name = user_profile.get('name', '고객')
    
    prompt = f"""
당신은 친근하고 공감 능력이 뛰어난 FreshMind AI 쇼핑 도우미입니다.

사용자 정보:
- 이름: {user_name}님
- 메시지: "{message}"
- 감정 상태: {sentiment_result.sentiment} (점수: {sentiment_result.score})
- 대화 의도: {intent_analysis.intent_type}

다음 지침에 따라 자연스럽고 따뜻한 응답을 생성해주세요:

1. 인사나 감사에는 친근하게 답변
2. 일상 대화에는 공감하며 대화 이어가기
3. 챗봇 질문에는 FreshMind의 역할 설명
4. 불만이나 부정적 감정에는 공감과 위로
5. 필요시 "음식이나 식재료 관련해서 도와드릴 것이 있으면 언제든 말씀해주세요!" 같은 안내 추가
6. 이모지를 적절히 사용하여 친근함 표현
7. 2-3문장 정도로 간결하게

응답만 작성해주세요 (JSON 형식 아님, 순수 텍스트):
"""
    
    try:
        if model == "gpt":
            client = get_openai_client()
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "당신은 친근하고 공감 능력이 뛰어난 쇼핑 도우미입니다."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.8
            )
            return response.choices[0].message.content.strip()
        else:  # gemini
            client = get_gemini_client()
            response = client.generate_content(
                f"당신은 친근하고 공감 능력이 뛰어난 쇼핑 도우미입니다.\n\n{prompt}",
                generation_config=genai.types.GenerationConfig(
                    temperature=0.8
                )
            )
            return response.text.strip()
        
    except Exception as e:
        print(f"일반 응답 생성 오류: {str(e)}")
        # 기본 응답
        if intent_analysis.intent_type == "greeting":
            return f"안녕하세요, {user_name}님! 😊 FreshMind AI 쇼핑 도우미입니다. 오늘 하루 어떠셨나요?"
        elif intent_analysis.intent_type == "casual_chat":
            return f"{user_name}님, 궁금하신 점이 있으시면 편하게 물어보세요! 음식이나 식재료 관련해서 도와드릴 수 있어요."
        else:
            return "무엇을 도와드릴까요? 식재료나 요리에 관련된 것이라면 언제든 말씀해주세요!"

