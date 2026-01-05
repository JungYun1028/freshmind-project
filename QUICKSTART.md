# ⚡ FreshMind 빠른 시작 가이드

팀원용 3분 시작 가이드입니다.

---

## 📋 필요한 것

- **Node.js** 16.x 이상
- **Python** 3.12 이상

---

## 🚀 빠른 시작 (3단계)

### 1️⃣ 저장소 클론
```bash
git clone https://github.com/JungYun1028/freshmind-project.git
cd freshmind-project
```

### 2️⃣ secret.json 파일 생성
프로젝트 루트에 `secret.json` 파일을 만들고 다음 내용을 붙여넣으세요:

```json
{
  "openai_api_key": "팀장에게 받은 API 키",
  "database_url": "postgresql://user:password@localhost:5432/freshmind_db"
}
```

> 💡 **API 키는 팀장에게 받으세요!**

### 3️⃣ 서버 실행
**터미널 2개를 열고:**

#### 터미널 1 - Backend
```bash
./start-backend.sh
```

#### 터미널 2 - Frontend  
```bash
./start-frontend.sh
```

> ⏱️ 처음 실행 시 가상환경 생성 + 의존성 설치로 2-3분 소요됩니다.

---

## 🎉 완료!

서버가 시작되면:
- **메인 앱**: http://localhost:3000
- **API 문서**: http://localhost:8001/docs

---

## 🐛 문제 해결

### "command not found: ./start-backend.sh"
```bash
chmod +x start-backend.sh start-frontend.sh
./start-backend.sh
```

### "포트가 이미 사용 중입니다"
```bash
# 기존 프로세스 종료
lsof -i :8001  # Backend 포트 확인
lsof -i :3000  # Frontend 포트 확인
kill -9 <PID>  # 해당 프로세스 종료
```

### "의존성 설치 오류"
```bash
# Backend
cd backend
rm -rf .venv
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 더 자세한 정보

- [SETUP.md](./SETUP.md): 완전한 설정 가이드
- [README.md](./README.md): 프로젝트 상세 설명

---

## 💬 질문이 있나요?

1. GitHub Issues 등록
2. 팀 채널에 문의
3. 코드 리뷰어에게 연락

**Happy Coding! 🎉**

