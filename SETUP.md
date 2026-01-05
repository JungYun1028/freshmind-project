# 🚀 FreshMind 개발 환경 설정 가이드

팀원을 위한 로컬 개발 환경 설정 가이드입니다.

## 📋 사전 요구사항

### 필수 설치
- **Node.js** 16.x 이상
- **Python** 3.12 이상
- **PostgreSQL** (선택사항 - DB 사용 시)
- **Git**

### 확인 방법
```bash
node --version   # v16.x 이상
python3 --version  # Python 3.12.x
git --version
```

---

## 🛠️ 초기 설정 (최초 1회)

### 1. 저장소 클론
```bash
git clone https://github.com/JungYun1028/freshmind-project.git
cd freshmind-project
```

### 2. Secret 파일 설정
프로젝트 루트에 `secret.json` 파일을 생성하고 다음 내용을 추가하세요:

```json
{
  "openai_api_key": "your-openai-api-key-here",
  "database_url": "postgresql://user:password@localhost:5432/freshmind_db"
}
```

> ⚠️ **주의**: `secret.json` 파일은 `.gitignore`에 포함되어 있어 Git에 커밋되지 않습니다.

### 3. Backend 설정
```bash
cd backend

# 가상환경 생성
python3 -m venv .venv

# 가상환경 활성화
source .venv/bin/activate

# 의존성 설치
pip install --upgrade pip
pip install -r requirements.txt
```

### 4. Frontend 설정
```bash
cd frontend

# 의존성 설치
npm install
```

---

## ▶️ 서버 실행 (매번 개발 시)

### 방법 1: 실행 스크립트 사용 (권장)

#### Backend 서버 시작
```bash
./start-backend.sh
```

#### Frontend 서버 시작
```bash
# 새 터미널 창에서
./start-frontend.sh
```

### 방법 2: 수동 실행

#### Backend (FastAPI)
```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

#### Frontend (Next.js)
```bash
cd frontend
npm run dev
```

---

## 🔗 접속 URL

개발 서버가 실행되면 다음 URL로 접속할 수 있습니다:

| 서비스 | URL | 설명 |
|--------|-----|------|
| **Frontend** | http://localhost:3000 | 메인 웹 애플리케이션 |
| **Backend API** | http://localhost:8001 | FastAPI 서버 |
| **API 문서** | http://localhost:8001/docs | Swagger UI (자동 생성) |
| **API 대체 문서** | http://localhost:8001/redoc | ReDoc UI |

---

## 🔧 주요 기능

### 1. AI 챗봇
- 우측 하단 보라색 부동 버튼 클릭
- OpenAI GPT-4를 활용한 감정 분석 및 상품 추천

### 2. 프로필 기반 추천
- 상단 프로필 버튼 클릭하여 정보 입력
- 연령대, 성별 기반 맞춤 상품 추천

### 3. 상품 검색 및 정렬
- 검색창에서 상품명, 카테고리, 태그 검색
- 개인화 추천순, 인기순, 가격순 등 정렬 가능

---

## 📂 프로젝트 구조

```
freshmind-project/
├── backend/              # FastAPI 백엔드
│   ├── .venv/           # Python 가상환경 (Git 제외)
│   ├── app/
│   │   ├── main.py      # FastAPI 앱 진입점
│   │   ├── routers/     # API 라우터
│   │   └── services/    # 비즈니스 로직
│   └── requirements.txt # Python 의존성
├── frontend/            # Next.js 프론트엔드
│   ├── app/
│   │   ├── components/  # React 컴포넌트
│   │   ├── contexts/    # Context API
│   │   ├── data/        # 더미 데이터
│   │   └── types/       # TypeScript 타입
│   ├── package.json     # Node.js 의존성
│   └── next.config.ts   # Next.js 설정
├── secret.json          # API 키 등 (Git 제외)
├── start-backend.sh     # Backend 시작 스크립트
└── start-frontend.sh    # Frontend 시작 스크립트
```

---

## 🐛 문제 해결

### Backend 서버가 시작되지 않을 때
```bash
# 가상환경 재생성
cd backend
rm -rf .venv
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### Frontend 빌드 에러
```bash
# node_modules 재설치
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### 포트 충돌
```bash
# 사용 중인 포트 확인 및 종료
lsof -i :8001  # Backend
lsof -i :3000  # Frontend

# 프로세스 종료
kill -9 <PID>
```

### OpenAI API 에러
1. `secret.json` 파일의 `openai_api_key` 확인
2. API 키 유효성 확인
3. API 할당량 확인

---

## 📝 개발 워크플로우

### 1. 브랜치 생성
```bash
git checkout -b feature/your-feature-name
```

### 2. 개발 및 커밋
```bash
git add .
git commit -m "feat: 기능 설명"
```

### 3. 푸시 및 PR
```bash
git push origin feature/your-feature-name
# GitHub에서 Pull Request 생성
```

---

## 🤝 팀 협업 규칙

### Commit 메시지 컨벤션
- `feat:` 새로운 기능 추가
- `fix:` 버그 수정
- `docs:` 문서 수정
- `style:` 코드 포맷팅
- `refactor:` 코드 리팩토링
- `test:` 테스트 코드
- `chore:` 빌드, 설정 파일 수정

### 예시
```bash
git commit -m "feat: AI 챗봇 감정 분석 기능 추가"
git commit -m "fix: 프로필 모달 텍스트 색상 수정"
```

---

## 📞 문의

문제가 발생하거나 질문이 있으면:
1. GitHub Issues에 등록
2. 팀 채널에 문의
3. 코드 리뷰 요청

---

**Happy Coding! 🎉**

