# 🛡️ TicketGuard

NFT 기반 스캘핑 방지 티켓팅 플랫폼

## 📌 프로젝트 개요

TicketGuard는 블록체인 기술을 활용하여 공연 티켓 시장의 암표 거래와 불법 양도를 기술적으로 차단하는 웹 서비스입니다.

### 핵심 기능

- **전송 제한**: NFT 티켓은 개인 간(P2P) 전송이 불가능
- **환불 및 재추첨**: 공식 환불만 가능하며, 환불된 티켓은 대기자에게 랜덤 추첨
- **Wallet-less 경험**: 사용자는 블록체인 지갑 없이 이메일만으로 NFT 소유

## 🛠 기술 스택

### Blockchain
- **Solidity** - 스마트 컨트랙트 언어
- **Hardhat** - 개발, 테스트, 배포
- **Polygon Amoy Testnet** - 배포 네트워크

### Backend
- **NestJS** - API 서버 프레임워크
- **Ethers.js** - 블록체인 통신
- **PostgreSQL + Prisma** - 데이터베이스 및 ORM

### Frontend
- **Next.js 14** (App Router) - React 프레임워크
- **Tailwind CSS + Shadcn/ui** - UI 스타일링
- **Zustand** - 상태 관리
- **NextAuth.js** - 인증 (Google OAuth)

## 📁 프로젝트 구조

```
blockchain-project/
├── ticketguard/          # 프론트엔드 (Next.js)
├── backend/              # 백엔드 (NestJS)
└── blockchain/           # 스마트 컨트랙트 (Hardhat)
```

## 🚀 시작하기

### 사전 요구사항
- Node.js 18+
- PostgreSQL (또는 Supabase 계정)
- MetaMask 지갑 (Admin 지갑용)

### 설치 및 실행

1. **환경 변수 설정**
   ```bash
   # backend/.env
   DATABASE_URL="postgresql://..."
   JWT_SECRET="your-secret"
   ADMIN_PRIVATE_KEY="0x..."
   CONTRACT_ADDRESS="0x..."
   RPC_URL="https://rpc-amoy.polygon.technology"

   # ticketguard/.env.local
   NEXT_PUBLIC_API_URL="http://localhost:3000"
   AUTH_SECRET="your-secret"
   GOOGLE_CLIENT_ID="..."
   GOOGLE_CLIENT_SECRET="..."
   ```

2. **백엔드 실행**
   ```bash
   cd backend
   npm install
   npx prisma db push
   npm run start:dev
   ```

3. **프론트엔드 실행**
   ```bash
   cd ticketguard
   npm install
   npm run dev
   ```

4. **스마트 컨트랙트 배포** (선택)
   ```bash
   cd blockchain
   npm install
   npx hardhat run scripts/deploy.ts --network amoy
   ```

## 🎯 주요 기능

### 사용자
- 이메일/Google 계정으로 회원가입 및 로그인
- 공연 목록 조회 및 티켓 구매
- 내 티켓 QR 코드 확인
- 티켓 환불 요청

### 관리자
- 공연 등록/수정/삭제
- 대기열 관리
- 티켓 발급 내역 확인

### 블록체인
- NFT 티켓 발행 (On-demand Minting)
- P2P 전송 차단
- 플랫폼 환불만 허용

## 🔗 배포

- Frontend: Vercel
- Backend: Railway
- Database: Supabase
- Blockchain: Polygon Amoy

## 📄 라이센스

This project is licensed under the MIT License.

## 👤 Author

Chaneun Yeo
