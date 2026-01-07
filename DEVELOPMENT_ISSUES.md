# 개발 시 예상 문제점 및 해결 방안

**작성일**: 2026-01-05  
**문서 버전**: 1.0.0

---

## 🚨 주요 문제점 및 해결 방안

### 1. 데이터베이스 스키마 불일치 문제 ⚠️ **중요**

#### 문제점
현재 코드베이스에 **두 가지 다른 스키마**가 존재합니다:

1. **`backend/database/schema.sql`** (PostgreSQL용)
   - `users.user_id` (SERIAL PRIMARY KEY)
   - `products.product_id` (SERIAL PRIMARY KEY)
   - 간단한 구조

2. **`backend/app/models.py`** (SQLAlchemy ORM)
   - `users.id` (Integer primary key)
   - `users.email`, `username`, `hashed_password` 등 추가 필드
   - `products.id` (Integer primary key)
   - 복잡한 구조 (Category, Order, CartItem 등)

#### 해결 방안

**옵션 A: schema.sql 기준으로 통일 (권장)**
- `schema.sql`의 구조를 기준으로 사용
- `models.py`를 `schema.sql`에 맞게 수정
- 장점: 기존 데이터 로딩 스크립트와 호환
- 단점: ORM 모델 재작성 필요

**옵션 B: models.py 기준으로 통일**
- `models.py`의 구조를 기준으로 사용
- `schema.sql`을 `models.py`에 맞게 수정
- 장점: ORM 활용 가능
- 단점: 기존 스크립트 수정 필요

**권장 사항**: 옵션 A 선택 (기존 스크립트와의 호환성)

---

### 2. 데이터베이스 연결 설정 불일치

#### 문제점
- `backend/app/database.py`: SQLite 기본 사용 (`sqlite:///./freshmind.db`)
- `backend/database/load_products_to_db.py`: PostgreSQL 직접 연결 (`psycopg2`)
- 두 가지 방식이 혼재되어 있음

#### 해결 방안
1. **환경 변수로 통일**
   ```python
   # .env 파일 또는 환경 변수
   DATABASE_URL=postgresql://user:password@localhost:5432/freshmind_db
   ```

2. **데이터 로딩 스크립트도 SQLAlchemy 사용하도록 변경**
   - 또는 PostgreSQL 직접 연결 유지 (성능상 유리)

---

### 3. Purchase History 테이블 누락

#### 문제점
- `schema.sql`에 `purchase_history` 테이블이 없음
- `models.py`에는 `PurchaseHistory` 모델이 있지만 스키마와 불일치

#### 해결 방안
1. `schema.sql`에 `purchase_history` 테이블 추가
2. `models.py`의 `PurchaseHistory` 모델을 스키마에 맞게 수정

```sql
-- schema.sql에 추가 필요
CREATE TABLE IF NOT EXISTS purchase_history (
  purchase_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  purchased_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);
```

---

### 4. 인증/로그인 시스템 부재

#### 문제점
- 프론트엔드는 로컬 스토리지로 프로필 관리
- 백엔드에는 인증 시스템이 없음
- 가상 유저를 어떻게 선택/로그인할지 불명확

#### 해결 방안

**옵션 A: 간단한 유저 선택 UI (개발용)**
- 프론트엔드에 유저 선택 드롭다운 추가
- 선택한 유저 ID를 로컬 스토리지에 저장
- API 호출 시 `user_id` 파라미터로 전달

**옵션 B: 세션 기반 인증 (향후 확장)**
- FastAPI 세션 관리
- 로그인 API 구현
- 쿠키/세션으로 유저 상태 관리

**권장 사항**: 옵션 A로 시작 (빠른 개발), 옵션 B는 향후 확장

---

### 5. API 라우터 미구현

#### 문제점
- `backend/app/main.py`에 필요한 라우터가 없음
- 현재는 `chatbot` 라우터만 존재

#### 필요한 라우터
- `users.py`: 유저 정보, 구매 요약
- `products.py`: 상품 추천, 트렌드
- `purchase_history.py`: 구매이력 조회

#### 해결 방안
각 라우터 파일 생성 및 `main.py`에 등록

---

### 6. 프론트엔드-백엔드 연동

#### 문제점
- 프론트엔드는 현재 로컬 데이터(`products.ts`) 사용
- 백엔드 API와 연동되지 않음

#### 해결 방안
1. API 호출 함수 생성 (`frontend/app/lib/api.ts`)
2. 기존 컴포넌트를 API 호출로 변경
3. 에러 핸들링 및 로딩 상태 관리

---

### 7. Products 테이블 ID 불일치

#### 문제점
- `schema.sql`: `product_id` 사용
- `models.py`: `id` 사용
- 프론트엔드: `id` 사용

#### 해결 방안
- API 응답 시 `product_id`를 `id`로 매핑
- 또는 프론트엔드에서 `product_id` 사용하도록 변경

---

### 8. 구매이력 더미데이터 생성 시 고려사항

#### 문제점
- Products 테이블의 실제 상품 ID를 사용해야 함
- 유저별 구매 패턴 시뮬레이션 로직 복잡
- 시간 분포 계산 필요

#### 해결 방안
1. **Products 테이블 조회**
   ```python
   # 실제 상품 ID 조회
   cur.execute("SELECT product_id, category FROM products")
   products = cur.fetchall()
   ```

2. **카테고리별 필터링**
   - 유저별 선호 카테고리에서 상품 선택

3. **시간 분포 생성**
   ```python
   from datetime import datetime, timedelta
   import random
   
   # 최근 6개월
   end_date = datetime.now()
   start_date = end_date - timedelta(days=180)
   ```

---

### 9. 추천 알고리즘 구현 복잡도

#### 문제점
- 구매이력 기반 추천 점수 계산 로직 복잡
- 여러 우선순위를 통합하는 알고리즘 필요

#### 해결 방안
1. **단계별 구현**
   - Phase 1: 구매이력 기반 점수만
   - Phase 2: 프로필 기반 점수 추가
   - Phase 3: 통합 점수 계산

2. **점수 계산 예시**
   ```python
   def calculate_recommendation_score(product, user_id):
       score = 0
       
       # 1. 구매이력 기반 (최대 50점)
       purchase_score = get_purchase_history_score(product, user_id)
       score += purchase_score * 0.5
       
       # 2. 프로필 기반 (최대 30점)
       profile_score = get_profile_score(product, user_id)
       score += profile_score * 0.3
       
       # 3. 인기도 기반 (최대 20점)
       popularity_score = get_popularity_score(product)
       score += popularity_score * 0.2
       
       return score
   ```

---

### 10. "핫한 요리" 정의 및 구현

#### 문제점
- "핫한 요리"의 명확한 정의 필요
- 트렌드 상승 상품을 어떻게 판단할지

#### 해결 방안
**임시 구현 (v1.0)**
- 최근 1개월 구매량이 많은 상품
- 유저가 구매하지 않은 상품
- `purchase_count` 기준으로 정렬

**향후 개선**
- 시계열 분석
- 구매량 증가율 계산
- 머신러닝 기반 트렌드 예측

---

## 📋 개발 순서 권장사항

### Step 1: 데이터베이스 스키마 통일 (최우선)
1. `schema.sql`에 `purchase_history` 테이블 추가
2. `models.py`를 `schema.sql`에 맞게 수정
3. 데이터베이스 마이그레이션 실행

### Step 2: 더미데이터 생성
1. `load_users_to_db.py` 작성 및 실행
2. `load_purchase_history_to_db.py` 작성 및 실행
3. 데이터 검증

### Step 3: 백엔드 API 구현
1. 라우터 파일 생성 (`users.py`, `products.py`, `purchase_history.py`)
2. API 엔드포인트 구현
3. 추천 알고리즘 로직 구현

### Step 4: 프론트엔드 연동
1. API 호출 함수 생성
2. 유저 선택 UI 추가
3. 추천 로직 연동

### Step 5: 테스트 및 검증
1. 각 유저로 로그인하여 추천 결과 확인
2. 성능 테스트
3. 에러 핸들링 확인

---

## 🔧 추가로 필요한 작업

### 1. 환경 설정 파일
- `.env.example` 파일 생성
- 데이터베이스 연결 정보 템플릿

### 2. 유틸리티 함수
- 날짜 계산 함수
- 점수 계산 헬퍼 함수
- 데이터 검증 함수

### 3. 에러 핸들링
- API 에러 응답 표준화
- 프론트엔드 에러 처리

### 4. 로깅
- 개발용 로깅 설정
- 디버깅을 위한 로그 출력

---

## 💡 개발 팁

1. **작은 단위로 개발**: 한 번에 하나씩 구현하고 테스트
2. **데이터 검증**: 각 단계마다 데이터 확인
3. **에러 처리**: 예외 상황 고려
4. **성능 고려**: 인덱스 활용, 쿼리 최적화

---

**최종 수정일**: 2026-01-05

