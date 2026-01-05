#!/bin/bash

# FreshMind Backend 시작 스크립트

echo "🚀 FreshMind Backend 서버를 시작합니다..."

# backend 디렉토리로 이동
cd "$(dirname "$0")/backend"

# 가상환경 활성화
if [ ! -d ".venv" ]; then
    echo "⚠️  가상환경이 없습니다. 생성 중..."
    python3 -m venv .venv
    echo "✅ 가상환경 생성 완료"
fi

echo "🔧 가상환경 활성화 중..."
source .venv/bin/activate

# 의존성 확인 및 설치
if [ ! -f ".venv/installed" ]; then
    echo "📦 의존성 설치 중..."
    pip install --upgrade pip
    pip install -r requirements.txt
    touch .venv/installed
    echo "✅ 의존성 설치 완료"
fi

# FastAPI 서버 실행
echo "✅ FastAPI 서버 시작 (포트 8001)"
echo "📍 API 문서: http://localhost:8001/docs"
echo ""
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload

