# YOUTURN API 명세서

## 개요
YOUTURN 농업 컨설팅 플랫폼의 RESTful API 명세서입니다.

**Base URL**: `http://localhost:3000`

**API Version**: `v1`

---

## 🔐 인증 (Authentication)

### 1. 회원가입
```http
POST /v1/auth/signup
```

**Request Body:**
```json
{
  "login_id": "user123",
  "password": "password123",
  "nickname": "홍길동"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "user_id": 1,
    "login_id": "user123",
    "nickname": "홍길동"
  }
}
```

### 2. 로그인
```http
POST /v1/auth/login
```

**Request Body:**
```json
{
  "login_id": "user123",
  "password": "password123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "user_id": 1,
    "login_id": "user123",
    "nickname": "홍길동"
  }
}
```

### 3. 사용자 정보 확인 (보호된 라우트)
```http
POST /v1/auth/me
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "ok": true
}
```

---

## 📝 농업 정보 관리 (Information)

### 1. 농업 정보 생성
```http
POST /v1/information
```

**Request Body:**
```json
{
  "user_id": 1,
  "gender": "MALE",
  "birth_date": "1990-01-01",
  "address": "경기도 안양시",
  "occupation": "직장인",
  "budget": 50000000,
  "family_member": "부부+자녀1명",
  "preferred_crops": "토마토, 상추",
  "preferred_region": "경기도 화성시",
  "farming_experience": 0,
  "etc": "친환경 농업에 관심이 많습니다."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "information_id": 1,
    "user_id": 1,
    "gender": "MALE",
    "birth_date": "1990-01-01",
    "address": "경기도 안양시",
    "occupation": "직장인",
    "budget": 50000000,
    "family_member": "부부+자녀1명",
    "preferred_crops": "토마토, 상추",
    "preferred_region": "경기도 화성시",
    "farming_experience": 0,
    "etc": "친환경 농업에 관심이 많습니다.",
    "created_at": "2025-08-23T14:30:00.000Z"
  },
  "message": "농업 정보가 성공적으로 생성되었습니다."
}
```

**필드 설명:**
- `gender`: `"MALE" | "FEMALE" | "OTHER"`
- `budget`: 예산 (원단위)
- `farming_experience`: 농업 경험 (년수)

---

## 🤖 농업 컨설팅 (Consulting)

### 1. 자동 컨설팅 생성 (LLM 연동) ⭐
```http
POST /v1/consulting/generate
```

**Request Body:**
```json
{
  "information_id": 1
}
```

**Response:**
```json
{
  "success": true,
  "consulting_id": 1,
  "data": {
    "user_info": {
      "budget": 50000000,
      "preferred_crops": "토마토, 상추",
      "preferred_region": "경기도 화성시",
      "farming_experience": 0
    },
    "consulting_result": "# 홍길동님 컨설팅 결과\n- 분석일시: 2025년 8월 23일\n- 컨설팅 ID: CONSULTING-000001\n\n## 1. 추천 지역\n...(마크다운 형식의 상세 컨설팅 내용)"
  },
  "message": "컨설팅이 성공적으로 생성되었습니다."
}
```

### 2. 컨설팅 조회
```http
GET /v1/consulting/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "consulting_id": 1,
    "information_id": 1,
    "content": "# 홍길동님 컨설팅 결과\n...",
    "created_at": "2025-08-23T14:30:00.000Z",
    "updated_at": "2025-08-23T14:30:00.000Z"
  },
  "message": "컨설팅 정보를 성공적으로 조회했습니다."
}
```

### 3. 컨설팅 결과만 조회
```http
GET /v1/consulting/:id/result
```

**Response:**
```json
{
  "success": true,
  "data": {
    "consulting_id": 1,
    "content": "# 홍길동님 컨설팅 결과\n- 분석일시: 2025년 8월 23일\n- 컨설팅 ID: CONSULTING-000001\n\n## 1. 추천 지역\n...(마크다운 형식)"
  },
  "message": "컨설팅 결과를 성공적으로 조회했습니다."
}
```

### 4. 컨설팅 재추천 (재생성) ⭐
```http
POST /v1/consulting/:id/regenerate
```

**Request Body:**
```json
{
  "additional_requirements": "유기농 인증을 받을 수 있는 방법도 포함해주세요."
}
```

**Response:**
```json
{
  "success": true,
  "consulting_id": 1,
  "data": {
    "user_info": {
      "budget": 50000000,
      "preferred_crops": "토마토, 상추",
      "preferred_region": "경기도 화성시",
      "farming_experience": 0
    },
    "previous_result": "# 이전 컨설팅 결과...",
    "new_result": "# 홍길동님 재컨설팅 결과\n...(새로운 마크다운 형식)",
    "additional_requirements": "유기농 인증을 받을 수 있는 방법도 포함해주세요."
  },
  "message": "컨설팅 재추천이 성공적으로 완료되었습니다."
}
```

### 5. 컨설팅 삭제
```http
DELETE /v1/consulting/:id
```

**Response:** `204 No Content`

### 6. 수동 컨설팅 생성 (백업용)
```http
POST /v1/consulting
```

**Request Body:**
```json
{
  "information_id": 1,
  "content": "수동으로 작성한 컨설팅 내용..."
}
```

---

## 💬 채팅 (Chat)

### 1. LLM에 프롬프트 전송 ⭐
```http
POST /v1/chat/send
```

**Request Body:**
```json
{
  "prompt": "농업에 대해 궁금한 것이 있어요. 토마토 재배 시기는 언제인가요?",
  "userId": "user123",
  "model": "gpt-oss:20b"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-v4-string",
    "prompt": "농업에 대해 궁금한 것이 있어요. 토마토 재배 시기는 언제인가요?",
    "response": "토마토는 일반적으로 봄(3-4월)에 파종하여...",
    "model": "gpt-oss:20b",
    "userId": "user123",
    "status": "completed",
    "created_at": "2025-08-23T14:30:00.000Z"
  },
  "message": "LLM 응답을 성공적으로 받았습니다."
}
```

**필드 설명:**
- `prompt`: 최대 5000자
- `userId`: 선택사항
- `model`: 기본값 `"gpt-oss:20b"`

### 2. 채팅 기록 조회
```http
GET /v1/chat/history?userId={userId}&limit={limit}
```

**Query Parameters:**
- `userId` (optional): 특정 사용자의 채팅 기록
- `limit` (optional): 조회할 개수 (기본값: 20)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-1",
      "prompt": "농업에 대해 궁금해요",
      "response": "농업에 대한 답변...",
      "model": "gpt-oss:20b",
      "userId": "user123",
      "status": "completed",
      "created_at": "2025-08-23T14:30:00.000Z"
    }
  ],
  "message": "채팅 기록을 성공적으로 조회했습니다.",
  "total": 1
}
```

### 3. 특정 채팅 조회
```http
GET /v1/chat/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "prompt": "농업에 대해 궁금해요",
    "response": "농업에 대한 답변...",
    "model": "gpt-oss:20b",
    "userId": "user123",
    "status": "completed",
    "created_at": "2025-08-23T14:30:00.000Z"
  },
  "message": "채팅을 성공적으로 조회했습니다."
}
```

### 4. LLM 서버 상태 확인
```http
GET /v1/chat/health/check
```

**Response:**
```json
{
  "success": true,
  "message": "LLM 서버가 정상적으로 작동중입니다.",
  "timestamp": "2025-08-23T14:30:00.000Z"
}
```

---

## 📋 컨설팅 보고서 형식

자동 생성되는 컨설팅 보고서는 다음과 같은 마크다운 형식을 따릅니다:

```markdown
# {사용자명}님 컨설팅 결과
- 분석일시: {현재 날짜}
- 컨설팅 ID: CONSULTING-{6자리 숫자}

## 1. 추천 지역
- 추천 근거: {입력값 기반 구체적 이유}
- 기후 조건: {온도, 강수량, 일조시간 등}
- 농업 환경: {토양 조건, 수리시설, 농협 지원}
- 생활 인프라: {병원, 학교 등 시설}

## 2. 추천 작물
- 추천 근거: {입력값 기반 구체적 이유}
- 재배 난이도: {상/중/하}
- 예상 수익: {구체적인 금액}
- 작물 특징: {설명}

## 3. 관련 정책 및 지원금
- 지원사업1: {설명, 신청기간, 링크}
- 지원사업2: {설명, 신청기간, 링크}
- 지원사업3: {설명, 신청기간, 링크}

## 4. 자금 활용 방안
- 총 금액: {사용자 입력값}
- 농지 구입/임차: {금액}
- 농기계/시설: {금액}
- 주거비: {금액}
- 운영자금: {금액}
- 기타 비용: {금액}

## 5. 귀농 로드맵
- 총 기간: {사용자 입력값}
- 준비 단계: {교육, 답사, 지원금 신청 등}
- 정착 단계: {이주, 농협 가입, 농사 시작}
- 안정 단계: {수확, 판매, 평가}

## 6. 가이드
- 재배 가이드: {파종/수확 시기, 농사 방법}
- 초보자 팁: {노하우, 교육 프로그램}
- 주의사항: {리스크 요소}
- 추가 정보: {유튜브, 사이트 링크}
```

---

## 🚨 에러 응답

모든 API는 다음과 같은 표준 에러 형식을 반환합니다:

```json
{
  "statusCode": 400,
  "timestamp": "2025-08-23T14:30:00.000Z",
  "path": "/v1/consulting/generate",
  "message": "잘못된 요청입니다."
}
```

**주요 HTTP 상태 코드:**
- `200`: 성공
- `201`: 생성 성공
- `204`: 삭제 성공 (응답 본문 없음)
- `400`: 잘못된 요청
- `401`: 인증 실패
- `404`: 리소스 없음
- `500`: 서버 오류

---

## 💡 사용 예시

### 전체 워크플로우 예시:

1. **회원가입/로그인**
   ```bash
   POST /v1/auth/signup
   ```

2. **농업 정보 입력**
   ```bash
   POST /v1/information
   ```

3. **자동 컨설팅 생성**
   ```bash
   POST /v1/consulting/generate
   ```

4. **컨설팅 결과 확인**
   ```bash
   GET /v1/consulting/1/result
   ```

5. **추가 요구사항으로 재추천**
   ```bash
   POST /v1/consulting/1/regenerate
   ```

6. **농업 관련 질문하기**
   ```bash
   POST /v1/chat/send
   ```

---

## 🔧 기술 스택

- **Backend**: NestJS + TypeScript
- **Database**: PostgreSQL + TypeORM
- **Authentication**: JWT
- **LLM Integration**: Custom HTTP Client
- **Validation**: class-validator

---

*최종 업데이트: 2025년 8월 23일*
