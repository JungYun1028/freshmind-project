# FreshMind - AI 쇼핑 어시스턴트

마켓컬리 스타일의 AI 챗봇 기반 식재료 쇼핑 플랫폼

## 📋 프로젝트 개요

- **목표**: 성별/나이 기반 개인화 추천 + AI 챗봇을 통한 맞춤 쇼핑 경험
- **개발 상태**: 프로토타입 단계
- **개발 기간**: 5-6일 예정

## 🎯 핵심 기능

### 1. 프로필 입력
- 입력 항목: 이름, 생년월일, 성별
- 나이대 자동 계산 (20s, 30s, 40s 등)
- 개인화 추천의 기초 데이터

### 2. 상품 정렬 화면
- **정렬 옵션**: 인기순, 신상품순, 가격순, 별점순, 개인화 추천순
- **구매이력 기반 추천**: 최근 구매이력과 유사한 상품 우선 추천
- 성별/나이별 맞춤 상품 자동 표시
- 카테고리별 필터링 (10개 카테고리)
- **핫한 요리 탭**: 트렌드 상품 추천 (밀키트/간편식 우선) ✨

### 2-1. 구매 요약 배너 (신규) ✨
- **위치**: 검색창 하단, 카테고리 필터 위
- **기능**: 로그인한 유저의 최근 한 달 구매 패턴을 분석하여 개인화된 메시지 표시
- **특징**:
  - 구체적인 구매 상품명 표시 (예: "삼각김밥 모음, 냉동 만두")
  - 구매 횟수 및 반복 구매 정보 제공
  - 유저별 맞춤 메시지 (5가지 템플릿 랜덤 선택)
  - 구매 패턴 인사이트 제공 ("3번이나 주문하시는 걸 보니...")

### 2-2. 핫한 요리 탭 (신규) ✨
- **위치**: 카테고리 필터에서 "전체" 버튼 옆
- **기능**: 트렌드 상품 추천 (밀키트/간편식 우선순위)
- **필터링 로직**:
  - **최근 1~2개월 내 구매한 상품**: 제외 (최근 구매 상품은 추천하지 않음)
  - **3개월 전에 구매한 상품**: 포함 가능 (오래 전 구매 상품도 트렌드면 다시 추천)
  - **미구매 상품**: 모두 포함 (새로운 상품 발견 기회 제공)
- **트렌드 점수 계산**:
  - **카테고리 우선순위**: 간편식/밀키트 (100점) > 냉동식품 (50점) > 해산물/육류 (30점)
  - **밀키트 보너스**: 밀키트 (+30점) > 즉석식품 (+20점) > 냉동식품 (+15점)
  - **인기도 점수**: 리뷰 수 × 평점 / 1000
  - **평점 보너스**: 4.7 이상 (+15점), 4.5 이상 (+10점)
  - **키워드 보너스**: 상품명에 "밀키트", "간편식", "레토르트" 포함 시 추가 점수
- **표시**: 트렌드 점수 기준 상위 30개 상품 표시
- **참고**: 현재는 더미데이터 사용 중, 실제 구매이력 데이터 반영 예정

### 3. AI 챗봇 (핵심 기능)
- 위치: 화면 하단 우측 고정
- 사용자 메시지 감정 분석
- 성별/나이 + 감정 기반 상품 추천 (3-5개)
- 각 상품마다 추천 이유 설명
- 장바구니 추가 기능

## 🏗️ 기술 스택

| 계층 | 기술 | 설명 |
|------|------|------|
| **Frontend** | Next.js 15 + TypeScript | React 웹 앱 |
| **Backend** | FastAPI (Python) | REST API + WebSocket |
| **Database** | PostgreSQL | 관계형 DB |
| **AI** | OpenAI GPT-4 | 감정분석 & 응답 생성 |
| **Styling** | Tailwind CSS | UI 디자인 |
| **이미지** | Unsplash | 무료 고품질 이미지 |

## 📊 데이터베이스 구조

### ERD
```
Users (사용자 프로필)
  └─ user_id, name, birth_date, gender, age_group
  
Products (상품 정보)
  └─ product_id, name, price, category
  └─ target_gender, target_age_groups (개인화 필드)
  └─ used_in (요리 용도)
  
Purchase_History (구매이력)
  └─ purchase_id, user_id, product_id, quantity
  └─ purchased_at (구매일시)
  
Chat_Messages (챗봇 대화)
  └─ message_id, user_id, message_text
  └─ sentiment, sentiment_score (감정 분석)
  └─ recommended_products (추천 상품 ID)
```

### 주요 테이블

**Users**
```sql
user_id, name, birth_date, gender, age_group
```

**Products** (100개 상품 데이터)
```sql
product_id, name, category, price, rating
target_age_groups: ["20s", "30s", "40s", "50s+"]
target_gender: "all" | "male-oriented" | "female-oriented"
used_in: ["찌개/국/탕", "볶음", "샐러드", ...]
```

**Purchase_History** (구매이력) ✅ 테이블 추가 완료
```sql
purchase_id, user_id, product_id, quantity, purchased_at, created_at
```

**Chat_Messages**
```sql
message_id, user_id, sender, message_text
sentiment, sentiment_score
recommended_products
```

## 🔌 API 설계

### 1. 프로필 관리

#### 현재 구현 (개발 단계)
프론트엔드에서 **로컬 스토리지 기반**으로 프로필을 관리합니다.

**가상 유저 계정 3개** (개발용):
```typescript
// frontend/app/data/mockUsers.ts
1. 김지은 (20대 여성, 2004-03-15) - 자취생, 간편식 선호
2. 박민수 (30대 남성, 1989-07-22) - 기혼, 밀키트 선호
3. 이영희 (40대 여성, 1979-11-08) - 가족, 건강식 선호
```

**프로필 전환 방식**:
- 기본값: 1번 유저(김지은)로 자동 로그인
- Header의 프로필 아바타 클릭 → 바텀시트에서 유저 전환
- 로컬 스토리지에 선택한 유저 정보 저장

#### 백엔드 API (향후 구현 예정)
```
POST /api/users
{
  "name": "김지은",
  "birth_date": "2004-03-15",
  "gender": "F"
}

GET /api/users/{user_id}
→ 사용자 프로필 정보 조회

PUT /api/users/{user_id}
{
  "name": "김지은",
  "birth_date": "2004-03-15",
  "gender": "F"
}
```

**데이터베이스 저장**:
- `schema.sql`에 가상 유저 3명이 미리 정의되어 있음
- `users` 테이블에 `user_id`, `name`, `birth_date`, `gender`, `age_group` 저장

### 2. 상품 조회
```
GET /products?sort_by=popularity&limit=20
GET /api/products/recommended?user_id={user_id}&limit=50
GET /api/products/trending?user_id={user_id}&limit=20
```

### 3. 구매이력 조회
```
GET /api/users/{user_id}/purchase-summary?period_days=30
→ 구매 요약 정보 (Top 상품, 반복 구매, 카테고리 선호도)

GET /api/users/{user_id}/purchase-history?limit=50&offset=0
→ 전체 구매이력 목록
```

**구매 요약 API 응답 예시:**
```json
{
  "user_id": 1,
  "user_name": "김지은",
  "total_purchases": 6,
  "insights": {
    "top_products": [
      {
        "product_id": 65,
        "product_name": "삼각김밥 모음",
        "purchase_count": 3,
        "weighted_score": 4.5
      }
    ],
    "repeat_purchases": [
      {
        "product_id": 65,
        "product_name": "삼각김밥 모음",
        "repeat_count": 3
      }
    ]
  },
  "message_variables": {
    "count": 6,
    "products": "삼각김밥 모음, 냉동 만두, 즉석 카레",
    "most_purchased": "삼각김밥 모음",
    "repeat_count": 3
  }
}
```

### 4. 챗봇 메시지 (WebSocket)
```
WS /chat/stream
→ {"action": "send", "message": "아이 간식 추천해줄래?"}
← {"type": "assistant_message", "products": [...]}
```

## 🚀 시작하기

### Prerequisites
- Node.js 18+
- Python 3.10+
- PostgreSQL 15+

### 설치 및 실행

#### 1. Frontend
```bash
cd frontend
npm install
npm run dev
# http://localhost:3000
```

#### 2. Backend
```bash
cd backend
pip install -r requirements.txt
source .venv/bin/activate  # 가상환경 활성화 (선택사항)
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
# http://localhost:8001
```

#### 3. Database 설정
```bash
# PostgreSQL 연결 정보
Database: freshmind_db
Host: localhost
Port: 5432
User: jejeong-yun

# 스키마 생성
psql freshmind_db -f backend/database/schema.sql

# 100개 상품 데이터 import
python3 backend/database/load_products_to_db.py

# 가상 유저 계정 생성 (3개)
python3 backend/database/load_users_to_db.py

# 구매이력 더미데이터 생성 (최근 6개월)
python3 backend/database/load_purchase_history_to_db.py
```

## 📦 프로젝트 구조

```
freshmind-project/
├── frontend/              # Next.js 웹 앱
│   ├── app/
│   │   ├── components/    # React 컴포넌트
│   │   │   ├── PurchaseSummaryBanner.tsx  # 구매 요약 배너
│   │   │   └── ...
│   │   ├── data/          # 데이터 파일
│   │   │   ├── products.ts        # 100개 상품 데이터
│   │   │   ├── messageTemplates.ts  # 메시지 템플릿
│   │   │   └── mockUsers.ts      # 가상 유저 데이터
│   │   ├── contexts/      # React Context
│   │   │   └── ProfileContext.tsx  # 프로필 관리
│   │   └── types/         # TypeScript 타입
│   └── ...
├── backend/               # FastAPI 백엔드
│   ├── app/
│   │   ├── main.py        # API 엔드포인트
│   │   ├── models.py      # DB 모델
│   │   ├── database.py    # DB 연결
│   │   ├── routers/       # API 라우터
│   │   │   ├── users.py   # 사용자 API
│   │   │   └── chatbot.py # 챗봇 API
│   │   └── services/      # 비즈니스 로직
│   │       └── purchase_insights.py  # 구매 인사이트 분석
│   └── database/
│       ├── schema.sql     # DB 스키마
│       ├── load_products_to_db.py
│       ├── load_users_to_db.py
│       └── load_purchase_history_to_db.py
├── README.md
├── DEVELOPMENT_SPEC.md
├── DATABASE_SETUP_GUIDE.md
├── RECOMMENDATION_LOGIC_DESIGN.md
└── IMPLEMENTATION_SUMMARY.md
```

## 📊 상품 데이터

### 총 100개 상품 (10개 카테고리)

| 카테고리 | 상품 수 | 예시 |
|---------|--------|------|
| 채소 | 15개 | 감자, 토마토, 브로콜리 |
| 과일 | 12개 | 샤인머스캣, 딸기, 바나나 |
| 육류/계란 | 12개 | 한우, 삼겹살, 닭가슴살 |
| 해산물 | 10개 | 연어, 새우, 오징어 |
| 유제품 | 8개 | 우유, 치즈, 요거트 |
| 간편식/밀키트 | 15개 | 김치찌개, 파스타 |
| 양념/오일 | 8개 | 간장, 올리브유 |
| 쌀/면/곡물 | 10개 | 백미, 스파게티 |
| 음료/차 | 5개 | 생수, 오렌지주스 |
| 냉동식품 | 5개 | 치킨너겟, 냉동블루베리 |

### 개인화 데이터 구조

각 상품은 타겟팅 정보를 포함합니다:

```typescript
{
  targetAge: ["20s", "30s", "40s", "50s+"],
  targetGender: "all" | "male-oriented" | "female-oriented",
  usedIn: ["찌개/국/탕", "볶음", "샐러드", ...],
  tags: ["유기농", "다이어트", "건강", ...]
}
```

## 🤖 추천 알고리즘

### 개인화 추천 로직
```
1. 구매이력 기반 추천 (최우선)
   - 최근 구매한 상품과 유사한 상품
   - 같은 카테고리 내 미구매 상품
   - 반복 구매 상품 우선순위 상승
   +
2. 사용자 프로필 (나이/성별)
   - target_age_groups, target_gender 매칭
   +
3. 인기도 기반 추천
   - 리뷰 수 × 평점
   ↓
4. 통합 추천 점수 계산
   ↓
5. 상위 상품 추천 + 이유 설명
```

### 구매이력 기반 추천 정렬 로직 (상세) ✨

개인화 추천 정렬에서 사용하는 **구매이력 기반 점수 계산** 방식:

#### 1. 구매이력 점수 계산 (`calculatePurchaseHistoryScore`)

각 상품에 대해 구매이력을 기반으로 점수를 계산합니다:

**① 반복 구매 상품 (최고 우선순위)**
- 기본 점수: **60점**
- 구매 횟수 보너스: 구매 횟수 × 5점
- 예시: 3회 구매 시 → 60 + (3 × 5) = **75점**

**② 최근 구매한 상품과 같은 카테고리**
- 기본 점수: **40점**
- 최근 구매 보너스: 최근 1개월 내 같은 카테고리 구매 시 +**20점**
- 예시: 최근 구매한 카테고리 상품 → 40 + 20 = **60점**

**③ 최근 구매한 상품과 유사한 상품 (같은 카테고리, 미구매)**
- 기본 점수: **30점**
- 최근 구매일 보너스:
  - 최근 1개월 내 구매한 카테고리: +**15점**
  - 최근 2개월 내 구매한 카테고리: +**10점**
- 예시: 최근 1개월 내 구매한 카테고리의 미구매 상품 → 30 + 15 = **45점**

**④ 미구매 상품 중 선호 카테고리**
- 기본 점수: **20점**
- 조건: 사용자가 자주 구매하는 카테고리(topCategories)에 속한 미구매 상품

#### 2. 통합 추천 점수 계산 (`calculatePersonalizedScore`)

구매이력 점수와 프로필 점수를 결합하여 최종 추천 점수를 계산합니다:

```
최종 점수 = 구매이력 점수(50%) + 프로필 점수(30%) + 인기도 점수(10%)
```

**가중치 상세:**

- **구매이력 점수**: 50% 가중치 (최우선)
  - 위에서 계산한 `calculatePurchaseHistoryScore` 결과 × 0.5
  
- **프로필 점수**: 30% 가중치
  - 연령대 매칭: 30점
  - 성별 매칭: 20점
  - 카테고리 보너스: 15점 (50% 반영)
  
- **인기도 점수**: 10% 가중치
  - 리뷰 수 기반: `min((reviews / 2000) × 10, 10)`

#### 3. 정렬 로직

"개인화 추천순" 정렬 시:

1. 모든 상품에 대해 `calculatePersonalizedScore` 함수로 점수 계산
2. 점수 기준 내림차순 정렬
3. 반복 구매 상품이 최상단에 표시
4. 최근 구매한 카테고리 상품이 우선 추천

#### 예시 계산

**예시 1**: 김지은(20대 여성) - 삼각김밥 모음 (반복 구매 3회)
```
구매이력 점수: 60 + (3 × 5) = 75점
→ 통합 점수: 75 × 0.5 = 37.5점
프로필 점수: 30 (연령대) + 20 (성별) + 7.5 (카테고리) = 57.5점
인기도 점수: min((8234 / 2000) × 10, 10) = 10점
최종 점수: 37.5 + 57.5 + 10 = 105점
```

**예시 2**: 박민수(30대 남성) - 제육볶음 밀키트 (반복 구매 4회, 최근 7일 전)
```
구매이력 점수: 60 + (4 × 5) = 80점
→ 통합 점수: 80 × 0.5 = 40점
프로필 점수: 30 (연령대) + 20 (성별) + 7.5 (카테고리) = 57.5점
인기도 점수: min((7234 / 2000) × 10, 10) = 10점
최종 점수: 40 + 57.5 + 10 = 107.5점
```

**예시 3**: 이영희(40대 여성) - 순두부찌개 밀키트 (반복 구매 5회, 최근 8일 전)
```
구매이력 점수: 60 + (5 × 5) = 85점
→ 통합 점수: 85 × 0.5 = 42.5점
프로필 점수: 30 (연령대) + 20 (성별) + 7.5 (카테고리) = 57.5점
인기도 점수: min((5821 / 2000) × 10, 10) = 10점
최종 점수: 42.5 + 57.5 + 10 = 110점
```

#### 구현 파일

- **프론트엔드**: `frontend/app/page.tsx`
  - `getPurchaseHistory()`: 구매이력 데이터 조회 (더미데이터)
  - `calculatePurchaseHistoryScore()`: 구매이력 기반 점수 계산
  - `calculatePersonalizedScore()`: 통합 추천 점수 계산
  - 정렬 로직: `filteredProducts` useMemo 내부

#### 향후 개선 사항

- 실제 API 연동: `GET /api/users/{user_id}/purchase-summary` 엔드포인트 사용
- 구매이력 데이터베이스 연동: `purchase_history` 테이블에서 실제 데이터 조회
- 실시간 업데이트: 구매 이력 변경 시 추천 점수 자동 갱신

### 구매이력 기반 점수 계산 (가중치 시스템) ✨

구매 요약 배너와 추천 시스템에서 사용하는 **가중치 기반 점수 계산** 방식:

```
상품 점수 = 구매횟수 × 시간가중치 × 반복구매보너스 × 수량가중치
```

#### 가중치 상세 설명

1. **시간 가중치** (최근 구매일수록 높은 점수)
   - 최근 1주일 내 구매: **1.5배**
   - 최근 1개월 내 구매: **1.2배**
   - 최근 3개월 내 구매: **1.0배**
   - 그 이전 구매: **0.7배**

2. **반복 구매 보너스** (같은 상품 여러 번 구매 시)
   - 1회 구매: **1.0배**
   - 2-3회 구매: **1.3배**
   - 4-5회 구매: **1.5배**
   - 6회 이상 구매: **2.0배**

3. **수량 가중치** (구매 수량이 많을수록)
   - 1개: **1.0배**
   - 2-3개: **1.2배**
   - 4개 이상: **1.5배**

#### 예시 계산

**예시 1**: 삼각김밥 모음을 최근 1주일 내 3번 구매, 수량 2개씩
```
점수 = 3 × 1.5 × 1.3 × 1.2 = 7.02점
```

**예시 2**: 제육볶음 밀키트를 최근 1개월 내 4번 구매, 수량 1개씩
```
점수 = 4 × 1.2 × 1.5 × 1.0 = 7.2점
```

이 점수를 기반으로 Top 3 상품을 선정하고, 구매 요약 배너에 표시합니다.

### 구매 요약 배너 로직 (신규) ✨

구매 요약 배너는 사용자의 구매 패턴을 분석하여 개인화된 메시지를 표시합니다:

```
1. 최근 한 달 구매이력 조회
   ↓
2. 가중치 기반 점수 계산
   - 시간 가중치 적용
   - 반복 구매 보너스 적용
   - 수량 가중치 적용
   ↓
3. Top 3 상품 선정
   - 가중치 점수 기준 정렬
   - 반복 구매 상품 우선
   ↓
4. 메시지 템플릿 선택
   - 유저별 5가지 템플릿 중 랜덤 선택
   - 가중치 기반 선택 (높은 가중치일수록 자주 선택)
   ↓
5. 변수 치환 및 UI 렌더링
   - 구매 횟수, 상품명, 반복 구매 횟수 등 치환
   - 구매 상품 칩 표시
```

### 핫한 요리 탭 로직 (신규) ✨

핫한 요리 탭은 트렌드 상품을 추천하며, 밀키트/간편식을 우선순위로 표시합니다:

```
1. 최근 1~2개월 구매이력 조회
   ↓
2. 필터링 규칙 적용
   - 최근 1~2개월 내 구매한 상품: 제외
   - 3개월 전 구매한 상품: 포함 가능 (트렌드면 표시)
   - 미구매 상품: 모두 포함
   ↓
3. 트렌드 점수 계산
   - 카테고리 우선순위 (간편식/밀키트 최고점)
   - 밀키트/즉석식품 보너스
   - 인기도 점수 (리뷰 × 평점)
   - 평점 보너스
   - 키워드 보너스 (밀키트, 간편식, 레토르트)
   ↓
4. 트렌드 점수 기준 정렬
   ↓
5. 상위 30개 상품 표시
```

**트렌드 점수 계산 예시:**
- 밀키트 상품: 100 (카테고리) + 30 (밀키트) + 인기도 + 평점 = **130점 이상**
- 즉석식품: 100 (카테고리) + 20 (즉석) + 인기도 + 평점 = **120점 이상**
- 냉동식품: 50 (카테고리) + 인기도 + 평점 = **50점 이상**

#### 메시지 템플릿 시스템

- **유저별 5가지 템플릿** 준비 (20대 여성, 30대 남성, 40대 여성)
- **랜덤 선택**: 매번 페이지 로드 시 다른 메시지 표시
- **가중치 기반**: 템플릿별 가중치에 따라 선택 빈도 조절

**메시지 예시:**
- "지은님, 지난 한 달간 **6회** 구매하셨네요! 삼각김밥 모음을 **3번**이나 주문하시는 걸 보니 정말 좋아하시는군요!"
- "민수님, 지난 한 달간 **15회** 구매하셨네요! 제육볶음 밀키트와 연어를 번갈아 주문하시는 걸 보니 요리 실력이 대단하시군요!"

### AI 챗봇 로직
```
1. 사용자 프로필 (나이/성별)
   +
2. 메시지 감정 분석 (positive/neutral/negative)
   +
3. 키워드 추출 (간식, 다이어트, 건강 등)
   +
4. 구매이력 분석
   ↓
5. 타겟팅 데이터 매칭
   ↓
6. 상위 3-5개 상품 추천 + 이유 설명
```

### 감정별 추천 전략

| 감정 | 추천 전략 |
|------|----------|
| **Positive** | 프리미엄 상품, 특별한 날 메뉴 |
| **Neutral** | 일반적인 맞춤 상품 |
| **Negative** | 간편식, 위로 음식, 건강식 |

### 성별/나이별 추천 전략

| 성별 | 나이 | 추천 카테고리 |
|------|------|--------------|
| M | 20s | 간식, 음료, 고단백 |
| M | 30s+ | 프리미엄, 건강식 |
| F | 20s | 간편식, 영양, 다이어트 |
| F | 30s+ | 가족 건강, 유기농 |

## ✅ 개발 상태

### 완료된 기능
- [x] Next.js 프론트엔드 구조
- [x] 100개 상품 더미 데이터
- [x] 검색/필터/정렬 기능
- [x] 반응형 UI 디자인
- [x] PostgreSQL DB 설정
- [x] 상품 데이터 DB 저장

### 진행 중 / 예정

#### 요구사항 ①: 가상 유저 계정 생성
- [x] 유저 페르소나 정의 완료
- [x] Users 테이블 스키마 확인 완료
- [x] 스키마 통일 완료 (schema.sql 기준)
- [ ] `load_users_to_db.py` 스크립트 작성
- [ ] 3개 유저 데이터 생성 및 삽입

#### 요구사항 ②: 구매이력 테이블 & 더미데이터
- [x] Purchase History 테이블 스키마 추가 완료
- [x] `models.py`에 PurchaseHistory 모델 추가 완료
- [ ] `load_purchase_history_to_db.py` 스크립트 작성
- [ ] 더미데이터 생성 로직 구현 (최근 6개월, 유저당 50~200건)

#### 요구사항 ③: 추천 UX & 알고리즘
- [x] 백엔드 API 라우터 구현 (users, products, purchase_history)
- [x] 구매 요약 API 구현 (`GET /api/users/{user_id}/purchase-summary`)
- [x] 추천 알고리즘 구현 (가중치 기반 점수 계산)
- [x] 프론트엔드 구매 요약 배너 컴포넌트
- [x] 랜덤 메시지 템플릿 시스템
- [x] 프론트엔드 "핫한 요리" 탭 로직 구현 (밀키트/간편식 우선순위)
- [ ] 추천 정렬 로직 개선 (구매이력 기반 정렬)
- [ ] 실제 구매이력 데이터 반영 (현재 더미데이터 사용 중)

### 기타 기능
- [ ] FastAPI 백엔드 구축 (기본 구조 완료)
- [ ] 프로필 입력 페이지
- [ ] OpenAI GPT-4 챗봇 연동
- [ ] 감정 분석 로직
- [ ] WebSocket 실시간 채팅
- [ ] 장바구니 기능

### 최근 업데이트 (2026-01-05)
- ✅ **스키마 통일 완료**: `schema.sql` 기준으로 `models.py` 재작성
- ✅ **Purchase History 테이블 추가**: 스키마 및 모델 완료
- ✨ 구매이력 기반 개인화 추천 시스템 설계
- ✨ 가상 유저 계정 3개 프로필 정의 (20대 자취생, 30대 기혼, 40대 가족)
- 📝 개발 스펙 문서 작성 (`DEVELOPMENT_SPEC.md`)
- 📝 개발 이슈 문서 작성 (`DEVELOPMENT_ISSUES.md`)

### 최근 업데이트 (2026-01-06) ✨
- ✅ **구매 요약 배너 구현 완료**: 개인화된 구매 패턴 메시지 표시
- ✅ **가중치 기반 점수 계산 로직**: 시간/반복구매/수량 가중치 적용
- ✅ **랜덤 메시지 템플릿 시스템**: 유저별 5가지 템플릿 랜덤 선택
- ✅ **구매 요약 API 구현**: `GET /api/users/{user_id}/purchase-summary`
- ✅ **프론트엔드 API 연동**: 구매이력 데이터 기반 배너 표시
- ✅ **핫한 요리 탭 로직 구현**: 트렌드 상품 추천 (밀키트/간편식 우선)
- 📝 추천 로직 설계 문서 작성 (`RECOMMENDATION_LOGIC_DESIGN.md`)
- 📝 구현 완료 요약 문서 작성 (`IMPLEMENTATION_SUMMARY.md`)

### 최근 업데이트 (2026-01-06 - 추가) ✨
- ✅ **핫한 요리 탭 필터링 로직**: 최근 1~2개월 구매 상품 제외, 3개월 전 구매 상품 포함 가능
- ✅ **트렌드 점수 계산 시스템**: 밀키트/간편식 우선순위, 인기도/평점 반영
- ⚠️ **참고**: 현재 더미데이터 사용 중, 실제 구매이력 데이터 반영 예정

## 📚 문서

- **[개발 스펙 문서](./DEVELOPMENT_SPEC.md)**: 구매이력 기반 추천 시스템 상세 스펙
- **[데이터베이스 설정 가이드](./DATABASE_SETUP_GUIDE.md)**: PostgreSQL 설정 및 더미데이터 생성 가이드 ⭐
- **[추천 로직 설계 문서](./RECOMMENDATION_LOGIC_DESIGN.md)**: 구매 요약 배너 및 추천 알고리즘 상세 설계
- **[구현 완료 요약](./IMPLEMENTATION_SUMMARY.md)**: 구매 요약 배너 구현 완료 요약
- **[설정 가이드](./SETUP.md)**: 개발 환경 설정 가이드
- **[빠른 시작](./QUICKSTART.md)**: 프로젝트 빠른 시작 가이드

## 🔗 참고 자료

- [Next.js Documentation](https://nextjs.org/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [OpenAI API](https://platform.openai.com/docs)

## 📝 라이선스

MIT

## 👥 팀

개발자: 정윤님

---

**Last Updated**: 2026-01-06  
**Version**: 0.3.0 (Prototype - 구매 요약 배너 구현 완료)
