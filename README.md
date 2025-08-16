# YOUTURN_SERVER

> 멋쟁이사자처럼 13기 해커톤 프로젝트

YOUTURN은 멋쟁이사자처럼 13기 해커톤 프로젝트입니다.

## 📁 프로젝트 구조

```
YOUTURN_SERVER/
├── README.md               # 프로젝트 메인 문서
├── src/                   # NestJS 소스 코드
│   ├── app.controller.ts  # 기본 컨트롤러
│   ├── app.module.ts      # 루트 모듈
│   ├── app.service.ts     # 기본 서비스
│   └── main.ts            # 애플리케이션 엔트리 포인트
├── test/                  # 테스트 파일
├── package.json           # 의존성 관리
├── docker-compose.yml     # Docker 개발 환경
├── Dockerfile             # Docker 이미지 빌드
├── deploy.sh              # AWS 배포 스크립트
└── ecosystem.config.js    # PM2 설정
```

## 🚀 시작하기

### 사전 요구사항
- Node.js (v18 이상)
- Yarn

### 설치 및 실행

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
   # .env 파일을 편집하여 데이터베이스 설정 등을 입력
   ```

4. **개발 서버 실행**
   ```bash
   yarn start:dev
   ```

서버가 성공적으로 실행되면 `http://localhost:3000`에서 접근할 수 있습니다.

## 📋 기본 구성

- NestJS 백엔드 서버
- PostgreSQL 데이터베이스 (AWS RDS)
- TypeORM을 통한 데이터베이스 관리
- AWS EC2 배포 환경 설정
- Docker 개발 환경

## 🛠 기술 스택

- **Backend**: NestJS
- **Runtime**: Node.js
- **Package Manager**: Yarn
- **Language**: TypeScript

## 🛠 개발 환경 설정

### 로컬 PostgreSQL 설정 (선택사항)
Docker를 사용하지 않고 로컬에서 개발하는 경우:

```bash
# PostgreSQL 설치 후 데이터베이스 생성
createdb youturn_dev
```

### Docker 개발 환경
```bash
# PostgreSQL + Redis 포함 전체 환경 실행
yarn docker:run

# 컨테이너 중지
yarn docker:down
```

## 🚀 AWS 배포 가이드

### 1. AWS RDS PostgreSQL 설정
- RDS 인스턴스 생성
- 보안 그룹에서 5432 포트 허용
- 데이터베이스 접속 정보 확인

### 2. EC2 서버 준비
```bash
# Node.js 18, Yarn, PM2 설치
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
npm install -g yarn pm2
```

### 3. 배포 실행
```bash
# 환경 변수 설정 후
yarn deploy
```

## 📡 API 엔드포인트

### 기본 엔드포인트
- `GET /` - 서버 상태 확인 ("Hello World!")

### 새 모듈 추가 방법
```bash
# NestJS CLI로 리소스 생성
nest generate resource <module-name>
```

## 👥 팀 정보

**멋쟁이사자처럼 13기 해커톤 팀**

## 📄 라이선스

이 프로젝트는 개인 프로젝트입니다.
