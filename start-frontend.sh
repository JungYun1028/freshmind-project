#!/bin/bash

# FreshMind Frontend 시작 스크립트

echo "🚀 FreshMind Frontend 서버를 시작합니다..."

# frontend 디렉토리로 이동
cd "$(dirname "$0")/frontend"

# 의존성 확인
if [ ! -d "node_modules" ]; then
    echo "📦 의존성 설치 중..."
    npm install
    echo "✅ 의존성 설치 완료"
fi

# Next.js 개발 서버 실행
echo "✅ Next.js 서버 시작 (포트 3000)"
echo "📍 앱 접속: http://localhost:3000"
echo ""
npm run dev

