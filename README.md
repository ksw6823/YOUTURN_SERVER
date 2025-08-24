# 🌱 YOUTURN - AI 농업 컨설팅 플랫폼

> 귀농을 꿈꾸는 사람들을 위한 AI 기반 농업 컨설팅 서비스

YOUTURN은 LLM(Large Language Model)을 활용하여 개인 맞춤형 농업 컨설팅을 제공하는 플랫폼입니다. 사용자의 농업 경험, 예산, 선호 작물 등을 분석하여 최적의 농업 계획을 제안하고, 실시간 농업 전문가 챗봇 서비스를 제공합니다.

## ✨ 주요 기능

### 🤖 AI 농업 컨설팅
- 개인 정보 기반 맞춤형 컨설팅 보고서 생성
- 추천 지역, 작물, 예상 수익, 관련 정책 정보 제공
- 마크다운 형식의 상세한 농업 계획서 제공
- 컨설팅 재추천 및 개선 기능

### 💬 AI 농업 챗봇
- 실시간 농업 관련 질문 답변
- 개인별 대화 기록 관리
- 과거 대화 이어하기 기능
- 농업 전문 지식 기반 상담

### 🔐 사용자 관리
- JWT 기반 안전한 인증 시스템
- 개인정보 보호 및 데이터 격리
- 사용자별 컨설팅 이력 관리

## 🏗️ 기술 스택

### Backend
- **Framework**: NestJS (Node.js)
- **Language**: TypeScript
- **Database**: PostgreSQL (AWS RDS)
- **ORM**: TypeORM
- **Authentication**: JWT + Passport
- **Validation**: class-validator, class-transformer

### AI/ML
- **LLM Server**: Ollama (gpt-oss:20b 모델)
- **HTTP Client**: Axios (NestJS HttpModule)

### Infrastructure
- **Cloud**: AWS (EC2, RDS)
- **Process Manager**: PM2
- **Containerization**: Docker & Docker Compose
- **Package Manager**: Yarn

## 📁 프로젝트 구조

```
YOUTURN_SERVER/
├── src/
│   ├── main.ts                    # 애플리케이션 진입점
│   ├── app.module.ts              # 루트 모듈
│   ├── common/                    # 공통 모듈
│   │   └── filters/               # 글로벌 예외 필터
│   └── v1/                        # API v1
│       ├── auth/                  # 인증 모듈
│       │   ├── auth.controller.ts # 로그인/회원가입
│       │   ├── auth.service.ts    # JWT 토큰 관리
│       │   ├── guards/            # JWT 인증 가드
│       │   └── strategies/        # Passport JWT 전략
│       ├── information/           # 농업 정보 모듈
│       │   ├── information.controller.ts
│       │   ├── information.service.ts
│       │   └── entities/          # Information 엔티티
│       ├── consultings/           # 컨설팅 모듈
│       │   ├── consultings.controller.ts
│       │   ├── consultings.service.ts  # LLM 연동 로직
│       │   ├── dto/               # 요청/응답 DTO
│       │   └── entities/          # Consulting 엔티티
│       └── chat/                  # 채팅 모듈
│           ├── chat.controller.ts
│           ├── chat.service.ts    # LLM 채팅 로직
│           ├── dto/               # 채팅 DTO
│           └── entities/          # Chat 엔티티
├── API_SPECIFICATION.md           # API 명세서
├── docker-compose.yml             # 개발 환경 설정
├── ecosystem.config.js            # PM2 프로덕션 설정
└── deploy.sh                      # AWS 배포 스크립트
```

## 🚀 시작하기

### 📋 사전 요구사항
- Node.js 18+ 
- Yarn
- PostgreSQL (로컬 개발) 또는 Docker
- LLM 서버 (Ollama)

### 🛠️ 설치 및 실행

1. **저장소 클론**
   ```bash
   git clone <repository-url>
   cd YOUTURN_SERVER
   ```

2. **의존성 설치**
   ```bash
   yarn install
   ```

3. **환경 변수 설정**
   ```bash
   cp .env.example .env
   ```
   
   `.env` 파일 설정:
   ```env
   # 데이터베이스
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=your_password
   DB_DATABASE=youturn_dev
   
   # JWT 설정
   JWT_ACCESS_SECRET=your_jwt_secret
   JWT_ACCESS_EXPIRES_IN=24h
   
   # LLM 서버
   LLM_SERVER_URL=http://your-llm-server:8080
   
   # 환경
   NODE_ENV=development
   PORT=3000
   ```

4. **데이터베이스 설정**
   
   **Option A: Docker 사용 (권장)**
   ```bash
   docker-compose up -d postgres
   ```
   
   **Option B: 로컬 PostgreSQL**
   ```bash
   createdb youturn_dev
   ```

5. **개발 서버 실행**
   ```bash
   yarn start:dev
   ```

서버가 실행되면 `http://localhost:3000`에서 접근 가능합니다.

## 📡 API 엔드포인트

### 🔐 인증 (Authentication)
- `POST /v1/auth/signup` - 회원가입
- `POST /v1/auth/login` - 로그인  
- `POST /v1/auth/me` - 사용자 정보 확인

### 📝 농업 정보 (Information)
- `POST /v1/information` - 농업 정보 등록

### 🤖 컨설팅 (Consultings)
- `POST /v1/consultings/generate` - AI 컨설팅 생성
- `GET /v1/consultings/user/:user_id` - 내 컨설팅 목록
- `GET /v1/consultings/:id` - 컨설팅 상세 조회
- `POST /v1/consultings/:id/regenerate` - 컨설팅 재생성
- `DELETE /v1/consultings/:id` - 컨설팅 삭제

### 💬 채팅 (Chat)
- `POST /v1/chat/send` - LLM 채팅 (JWT 필요)
- `GET /v1/chat/history` - 내 채팅 기록 (JWT 필요)
- `GET /v1/chat/:id` - 특정 채팅 조회 (JWT 필요)
- `GET /v1/chat/health/check` - LLM 서버 상태 확인

> 📖 **상세한 API 명세는 [API_SPECIFICATION.md](API_SPECIFICATION.md)를 참조하세요.**

## 🗄️ 데이터베이스 구조

```
User (사용자)
  ├── user_id (PK)
  ├── login_id (unique)
  ├── password (bcrypt)
  └── nickname
  
Information (농업정보)
  ├── information_id (PK)
  ├── user_id (FK) → User
  ├── budget (예산)
  ├── preferred_crops (선호작물)
  ├── preferred_region (선호지역)
  ├── farming_experience (농업경험)
  └── ... (기타 개인정보)

Consulting (컨설팅)
  ├── consulting_id (PK)
  ├── information_id (FK) → Information
  ├── content (마크다운 보고서)
  ├── created_at
  └── updated_at

Chat (채팅)
  ├── id (UUID PK)
  ├── user_id (FK) → User
  ├── prompt (사용자 질문)
  ├── response (AI 답변)
  ├── model (LLM 모델명)
  ├── status (pending/completed/failed)
  ├── responseTime (응답시간)
  └── createdAt
```

## 🚀 배포 가이드

### AWS EC2 + RDS 배포

1. **RDS PostgreSQL 설정**
   - RDS 인스턴스 생성
   - 보안 그룹에서 5432 포트 허용
   - SSL 설정 조정

2. **EC2 서버 설정**
   ```bash
   # Node.js 18 설치
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Yarn 및 PM2 설치
   npm install -g yarn pm2
   ```

3. **배포 실행**
   ```bash
   # 프로덕션 환경변수 설정 후
   ./deploy.sh
   ```

### Docker 배포

```bash
# 프로덕션 이미지 빌드
docker build -t youturn-server .

# 컨테이너 실행
docker run -d -p 3000:3000 --env-file .env.production youturn-server
```

## 🔧 개발 가이드

### 새로운 모듈 추가
```bash
# NestJS CLI로 리소스 생성
npx nest generate resource <module-name>
```

### 데이터베이스 마이그레이션
```bash
# 개발 환경 (synchronize: true 활용)
yarn start:dev

# 프로덕션 환경 (마이그레이션 파일 생성)
npx typeorm migration:generate src/migrations/MigrationName
npx typeorm migration:run
```

### 코드 품질 관리
```bash
# 린팅
yarn lint

# 빌드 테스트
yarn build

# 유닛 테스트
yarn test

# E2E 테스트  
yarn test:e2e
```

## 🛡️ 보안

- **JWT 인증**: 24시간 만료 토큰
- **비밀번호 암호화**: bcrypt 해싱
- **개인정보 보호**: 사용자별 데이터 격리
- **입력값 검증**: class-validator 활용
- **SQL 인젝션 방지**: TypeORM Parameterized Query
- **CORS 설정**: 프론트엔드 도메인 제한

## 🔍 모니터링

### 로그 시스템
- **개발**: Console 로그 + TypeORM 쿼리 로그
- **프로덕션**: PM2 로그 관리 + 에러 추적

### 헬스체크
```bash
# 서버 상태 확인
curl http://localhost:3000

# LLM 서버 연결 확인  
curl http://localhost:3000/v1/chat/health/check
```

## 🤝 기여하기

1. 이 저장소를 Fork합니다
2. 새로운 기능 브랜치를 생성합니다 (`git checkout -b feature/AmazingFeature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 Push합니다 (`git push origin feature/AmazingFeature`)
5. Pull Request를 열어주세요

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해주세요.

---

**YOUTURN - 농업의 새로운 전환점** 🌱