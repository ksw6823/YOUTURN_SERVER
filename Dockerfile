# Multi-stage build for production
FROM node:18-alpine AS builder

# 작업 디렉토리 설정
WORKDIR /app

# package.json과 yarn.lock 복사
COPY package.json yarn.lock ./

# 의존성 설치
RUN yarn install --frozen-lockfile

# 소스 코드 복사
COPY . .

# 애플리케이션 빌드
RUN yarn build

# Production stage
FROM node:18-alpine AS production

# 작업 디렉토리 설정
WORKDIR /app

# package.json과 yarn.lock 복사
COPY package.json yarn.lock ./

# 프로덕션 의존성만 설치
RUN yarn install --frozen-lockfile --production && yarn cache clean

# 빌드된 애플리케이션 복사
COPY --from=builder /app/dist ./dist

# 사용자 생성 및 권한 설정
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001
USER nestjs

# 포트 노출
EXPOSE 3000

# 애플리케이션 실행
CMD ["node", "dist/main"]
