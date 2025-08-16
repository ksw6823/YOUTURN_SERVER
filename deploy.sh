#!/bin/bash

# AWS EC2 배포 스크립트
set -e

echo "🚀 YOUTURN Server 배포를 시작합니다..."

# 환경 변수 확인
if [ -z "$DB_HOST" ] || [ -z "$DB_USERNAME" ] || [ -z "$DB_PASSWORD" ]; then
    echo "❌ 필수 환경 변수가 설정되지 않았습니다."
    echo "DB_HOST, DB_USERNAME, DB_PASSWORD를 설정해주세요."
    exit 1
fi

# 의존성 설치
echo "📦 의존성을 설치합니다..."
yarn install --frozen-lockfile

# 애플리케이션 빌드
echo "🔨 애플리케이션을 빌드합니다..."
yarn build

# 로그 디렉토리 생성
mkdir -p logs

# PM2로 애플리케이션 시작/재시작
echo "🔄 애플리케이션을 시작합니다..."
if pm2 show youturn-server > /dev/null 2>&1; then
    echo "기존 애플리케이션을 재시작합니다..."
    pm2 restart ecosystem.config.js --env production
else
    echo "새로운 애플리케이션을 시작합니다..."
    pm2 start ecosystem.config.js --env production
fi

# PM2 설정 저장
pm2 save

echo "✅ 배포가 완료되었습니다!"
echo "📊 PM2 상태 확인: pm2 status"
echo "📄 로그 확인: pm2 logs youturn-server"
