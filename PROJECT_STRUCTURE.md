# 📁 FreshMind 프로젝트 구조

마지막 업데이트: 2026-01-02

## 🗂️ 디렉토리 구조

```
freshmind-project/
│
├── 📄 README.md                    # 프로젝트 메인 문서
├── 📄 .gitignore                   # Git 제외 파일
│
├── 📂 frontend/                    # Next.js 웹 앱
│   ├── 📂 app/
│   │   ├── 📂 components/          # React 컴포넌트
│   │   │   ├── BottomNav.tsx       # 하단 네비게이션
│   │   │   ├── CategoryFilter.tsx  # 카테고리 필터
│   │   │   ├── Header.tsx          # 헤더
│   │   │   ├── ProductCard.tsx     # 상품 카드
│   │   │   ├── SearchBar.tsx       # 검색바
│   │   │   └── SortFilter.tsx      # 정렬 필터
│   │   │
│   │   ├── 📂 data/
│   │   │   └── products.ts         # 100개 상품 데이터
│   │   │
│   │   ├── 📂 types/
│   │   │   └── product.ts          # TypeScript 타입 정의
│   │   │
│   │   ├── page.tsx                # 메인 페이지
│   │   ├── layout.tsx              # 레이아웃
│   │   ├── globals.css             # 글로벌 스타일
│   │   └── favicon.ico
│   │
│   ├── 📂 public/                  # 정적 파일
│   ├── package.json
│   ├── next.config.ts
│   ├── tsconfig.json
│   └── README.md                   # Next.js 문서
│
└── 📂 backend/                     # FastAPI 백엔드
    ├── 📂 app/
    │   ├── __init__.py
    │   ├── main.py                 # FastAPI 엔트리포인트
    │   ├── database.py             # DB 연결 설정
    │   └── models.py               # SQLAlchemy 모델
    │
    ├── 📂 database/
    │   ├── schema.sql              # PostgreSQL 스키마
    │   └── load_products_to_db.py  # 상품 데이터 import 스크립트
    │
    ├── 📂 tests/                   # 테스트 코드
    └── requirements.txt            # Python 패키지
```

## 📊 주요 파일 설명

### Frontend

| 파일 | 설명 | 상태 |
|------|------|------|
| `app/page.tsx` | 메인 페이지 (상품 목록) | ✅ 완료 |
| `app/data/products.ts` | 100개 상품 데이터 | ✅ 완료 |
| `app/types/product.ts` | Product 인터페이스 | ✅ 완료 |
| `app/components/*.tsx` | 6개 React 컴포넌트 | ✅ 완료 |
| `next.config.ts` | Unsplash 이미지 설정 | ✅ 완료 |

### Backend

| 파일 | 설명 | 상태 |
|------|------|------|
| `app/main.py` | FastAPI 메인 (API 엔드포인트) | ⏳ 진행 예정 |
| `app/models.py` | DB 모델 (Users, Products, Messages) | ⏳ 진행 예정 |
| `app/database.py` | PostgreSQL 연결 | ⏳ 진행 예정 |
| `database/schema.sql` | DB 스키마 (3개 테이블) | ✅ 완료 |
| `database/load_products_to_db.py` | 상품 import 스크립트 | ✅ 완료 |
| `requirements.txt` | Python 패키지 목록 | ✅ 완료 |

## 🗄️ 데이터베이스

### PostgreSQL 정보
```
Database: freshmind_db
Host: localhost:5432
User: jejeong-yun
```

### 테이블 (3개)
```
✅ users          - 사용자 프로필
✅ products       - 100개 상품 (개인화 필드 포함)
✅ chat_messages  - 챗봇 대화 기록
```

## 🔧 사용 기술

### Frontend
- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Image**: Unsplash (무료 이미지)

### Backend
- **Framework**: FastAPI
- **Language**: Python 3.10+
- **Database**: PostgreSQL 15+
- **AI**: OpenAI GPT-4 (예정)

## 📦 패키지

### Frontend (`package.json`)
```json
{
  "dependencies": {
    "next": "15.x",
    "react": "^18",
    "typescript": "^5"
  }
}
```

### Backend (`requirements.txt`)
- fastapi
- uvicorn
- sqlalchemy
- psycopg2-binary
- python-dotenv
- (AI 라이브러리 추가 예정)

## 🚫 제외된 파일 (.gitignore)

```
node_modules/
.next/
__pycache__/
*.pyc
.env
.DS_Store
```

## 📝 문서

| 파일 | 내용 |
|------|------|
| `README.md` | 프로젝트 전체 설명 + 기획서 |
| `frontend/README.md` | Next.js 사용법 |
| `PROJECT_STRUCTURE.md` | 이 파일 (구조 설명) |

## 🗑️ 삭제된 파일

리팩토링으로 삭제된 불필요한 파일들:
- ❌ `DATA_README.md` (내용 통합)
- ❌ `HISTORY.md` (Git history로 대체)
- ❌ `backend/database/seed_products.py` (사용 안함)
- ❌ `export_products.js` (임시 파일)
- ❌ `backend/database/products.json` (임시 파일)

## 🎯 다음 작업

1. **Backend API 구현**
   - POST /profile
   - GET /products
   - WS /chat/stream

2. **Frontend 연동**
   - 프로필 입력 페이지
   - API 연동
   - 챗봇 UI

3. **AI 기능**
   - OpenAI GPT-4 연동
   - 감정 분석
   - 상품 추천 로직

## 📊 코드 통계

```
Frontend:
  - TypeScript 파일: 10개
  - React 컴포넌트: 6개
  - 상품 데이터: 100개
  - 라인 수: ~2,000줄

Backend:
  - Python 파일: 4개
  - DB 테이블: 3개
  - 라인 수: ~300줄

Total: ~2,300줄
```

---

**정리 완료일**: 2026-01-02  
**버전**: 0.1.0

