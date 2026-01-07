# FreshMind 개발 스펙 문서

**버전**: 1.0.0
**작성일**: 2026-01-05
**작성자**: 개발팀

---

## 1. 프로젝트 개요

### 1.1 배경

유저의 **구매이력 + 프로필 정보**를 기반으로 로그인 시 개인화된 상품 추천을 제공하는 시스템을 구현한다.

### 1.2 작업 범위

* 가상 유저 계정 3개 생성
* 최근 6개월 구매이력 더미데이터 생성
* 구매이력 기반 추천 UX 및 알고리즘 개선

---

## 2. 요구사항 ① 가상 유저 계정 생성

### 2.1 유저 페르소나 정의

#### 👩 20대 대학생 여성 (1인 가구)

* **특성**: 자취, 가격 민감, 간편식 선호
* **구매 키워드**: 간편식 · 냉동식품 · 즉석식품

#### 👨 30대 중반 직장인 남성 (2인 가구)

* **특성**: 기혼, 밀키트·요리 선호, 프리미엄 지향
* **구매 키워드**: 밀키트 · 육류 · 해산물 · 조미료

#### 👩 40대 중반 직장인 여성 (3인 가구)

* **특성**: 가족 단위, 건강식·아동 식품 선호
* **구매 키워드**: 밀키트 · 유제품 · 냉동식품 · 간식

---

### 2.2 Users 테이블

```sql
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  birth_date DATE,
  gender VARCHAR(10),
  age_group VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**선택 확장 필드**

* `lifestyle_tags` (JSON)
* `preferred_categories` (JSON)

### 2.3 구현

* 스크립트: `load_users_to_db.py`
* PostgreSQL에 3명 유저 삽입 및 검증

---

## 3. 요구사항 ② 구매이력 테이블 & 더미데이터

### 3.1 Purchase History 테이블

```sql
CREATE TABLE purchase_history (
  purchase_id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(user_id),
  product_id INT REFERENCES products(product_id),
  quantity INT,
  purchased_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**주요 인덱스**

* `(user_id, purchased_at DESC)`
* `(product_id)`

---

### 3.2 더미데이터 생성 규칙

* 기간: 최근 6개월
* 유저당 50~200건
* 유저별 구매 패턴 반영

| 유저     | 주 구매 빈도 | 주요 카테고리   |
| ------ | ------- | --------- |
| 20대 여성 | 월 1회    | 간편식, 냉동식품 |
| 30대 남성 | 월 2~3회  | 밀키트, 육류   |
| 40대 여성 | 월 2~4회  | 밀키트, 유제품  |

### 3.3 구현

* 스크립트: `load_purchase_history_to_db.py`
* products 테이블과 실제 ID 매핑

---

## 4. 요구사항 ③ 추천 UX & 알고리즘

### 4.1 추천 우선순위

1. **구매이력 기반** (최근·반복 구매)
2. **프로필 기반** (나이·성별)
3. **인기도 기반** (리뷰·평점)

---

### 4.2 UI/UX 변경

#### ① 구매 요약 배너

* 위치: 검색창 하단
* 내용: 최근 1개월 구매 특성 요약 문구
* API: `GET /api/users/{id}/purchase-summary`

#### ② "핫한 요리" 탭

* 조건: 미구매 + 최근 트렌드 상승 상품
* API: `GET /api/products/trending`

#### ③ 추천 리스트 정렬

* 점수 기반 통합 정렬

---

## 5. API 설계 요약

### Users

* `GET /api/users/{id}`
* `GET /api/users/{id}/purchase-summary`

### Products

* `GET /api/products/recommended`
* `GET /api/products/trending`

### Purchase History

* `GET /api/purchase-history/{user_id}`
* `POST /api/purchase-history` (개발용)

---

## 6. 개발 체크리스트

### Phase 1. DB & 데이터

* [x] **스키마 통일 완료** (schema.sql 기준으로 models.py 수정)
* [x] **Purchase History 테이블 추가** (schema.sql에 추가 완료)
* [ ] Users 테이블 더미 유저 3개 생성 스크립트 작성
* [ ] Purchase History 더미데이터 생성 스크립트 작성
* [ ] 데이터베이스 마이그레이션 실행

### Phase 2. 백엔드

* [ ] Users API 라우터 생성 (`/api/users/{id}`, `/api/users/{id}/purchase-summary`)
* [ ] Products API 라우터 생성 (`/api/products/recommended`, `/api/products/trending`)
* [ ] Purchase History API 라우터 생성 (`/api/purchase-history/{user_id}`)
* [ ] 구매 요약 로직 구현
* [ ] 추천 알고리즘 로직 구현 (구매이력 기반 점수 계산)
* [ ] 트렌드 상품 로직 구현

### Phase 3. 프론트엔드

* [ ] 유저 선택 UI 추가 (개발용 드롭다운)
* [ ] API 호출 함수 생성 (`lib/api.ts`)
* [ ] 구매 요약 배너 컴포넌트 (`PurchaseSummaryBanner.tsx`)
* [ ] 핫한 요리 탭 추가 (`CategoryFilter.tsx` 수정)
* [ ] 추천 정렬 로직 개선 (`page.tsx`)

### Phase 4. 검증

* [ ] 각 유저로 로그인하여 추천 결과 확인
* [ ] 추천 정확도 검증
* [ ] UX 동작 확인

---

## 7. 참고 및 확장

* 인덱스 기반 성능 최적화
* 추천 알고리즘 ML 확장 고려
* A/B 테스트 가능 구조 유지

---

---

## 8. 작업 현황

### ✅ 완료된 작업

1. **스키마 통일** (2026-01-05)
   - `schema.sql`에 `purchase_history` 테이블 추가 완료
   - `models.py`를 `schema.sql` 기준으로 재작성 완료
   - 모든 테이블이 `schema.sql`과 일치하도록 수정

### 🔄 진행 중인 작업

1. **요구사항 ①: 가상 유저 계정 생성**
   - [ ] `load_users_to_db.py` 스크립트 작성 필요
   - [ ] 3개 유저 데이터 생성 및 삽입

2. **요구사항 ②: 구매이력 테이블 & 더미데이터**
   - [x] 테이블 스키마 완료
   - [ ] `load_purchase_history_to_db.py` 스크립트 작성 필요
   - [ ] 더미데이터 생성 로직 구현

3. **요구사항 ③: 추천 UX & 알고리즘**
   - [ ] 백엔드 API 구현 필요
   - [ ] 프론트엔드 UI 컴포넌트 구현 필요

---

**최종 수정일**: 2026-01-05
