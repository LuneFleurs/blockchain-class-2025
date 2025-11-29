export type Language = 'en' | 'ko';

export const translations = {
  en: {
    // Navbar
    nav: {
      events: 'Events',
      myTickets: 'My Tickets',
      login: 'Login',
      register: 'Register',
      logout: 'Logout',
    },

    // Home Page
    home: {
      badge: 'Blockchain-Powered Security',
      title: 'Fair tickets.',
      subtitle: 'No scalping.',
      description: 'TicketGuard uses blockchain technology to prevent ticket scalping and fraud. Buy tickets at face value, always.',
      browseEvents: 'Browse Events',
      getStarted: 'Get Started',

      // Features
      howItWorks: 'How it works',
      featuresSubtitle: 'Revolutionary anti-scalping technology built on blockchain',

      feature1Title: 'Transfer Locked',
      feature1Desc: 'NFT tickets cannot be transferred between individuals, preventing unauthorized resale.',

      feature2Title: 'Fair Refunds',
      feature2Desc: 'Return tickets to the platform at face value. No markups, no scalping.',

      feature3Title: 'Random Lottery',
      feature3Desc: 'Refunded tickets are redistributed through fair random selection to waitlisted buyers.',

      feature4Title: 'No Wallet Needed',
      feature4Desc: 'We manage blockchain wallets for you. Simple email login, just like any website.',

      // CTA
      ctaTitle: 'Ready to experience fair ticketing?',
      ctaDescription: 'Join thousands who have secured their tickets without overpaying to scalpers.',
      ctaButton: 'View Available Events',
    },

    // Events Page
    events: {
      title: 'Upcoming Events',
      subtitle: 'Browse and purchase tickets for concerts, festivals, and more',
      available: 'available',
      soldOut: 'Sold Out',
      almostSoldOut: 'Almost Sold Out',
      viewDetails: 'View Details',
      perTicket: 'per ticket',
    },

    // Event Detail Page
    eventDetail: {
      backToEvents: 'Back to Events',
      eventNotFound: 'Event not found',
      failedToLoad: 'Failed to load event',
      aboutEvent: 'About this event',
      ticketInfo: 'Ticket Information',
      price: 'Price',
      availability: 'Availability',
      ticketsAvailable: 'tickets available',
      purchaseTicket: 'Purchase Ticket',
      purchasing: 'Processing...',
      antiScalpingTitle: 'Anti-Scalping Protection',
      antiScalpingDesc: 'This ticket is protected by blockchain technology and cannot be resold to scalpers.',
      transferRestriction: 'Transfer Restriction',
      transferDesc: 'NFT tickets cannot be transferred between users',
      fairRefund: 'Fair Refund',
      refundDesc: 'Return to platform at original price',
      randomLottery: 'Random Lottery',
      lotteryDesc: 'Refunded tickets redistributed fairly',
    },

    // Auth
    auth: {
      loginTitle: 'Welcome back',
      loginSubtitle: 'Enter your email to sign in to your account',
      registerTitle: 'Create an account',
      registerSubtitle: 'Enter your email to create your account',
      email: 'Email',
      password: 'Password',
      emailPlaceholder: 'you@example.com',
      passwordPlaceholder: 'Enter your password',
      loginButton: 'Sign In',
      signingIn: 'Signing in...',
      registerButton: 'Create Account',
      creatingAccount: 'Creating account...',
      noAccount: "Don't have an account?",
      hasAccount: 'Already have an account?',
      registerNow: 'Register now',
      signInNow: 'Sign in now',
      demoNote: 'Demo: Use any email and password to test the system. Your wallet will be created automatically!',
      confirmPassword: 'Confirm Password',
      createPasswordPlaceholder: 'Create a password',
      confirmPasswordPlaceholder: 'Confirm your password',
      passwordMismatch: 'Passwords do not match',
      passwordTooShort: 'Password must be at least 6 characters',
      registrationFailed: 'Registration failed. Please try again.',
      walletFreeTitle: 'Wallet-free experience',
      walletFreeDesc: "We'll create and manage a blockchain wallet for you automatically. No crypto knowledge required!",
      orContinueWith: 'Or continue with',
      googleSignIn: 'Sign in with Google',
      googleRegister: 'Sign up with Google',
    },

    // My Tickets
    myTickets: {
      title: 'My Tickets',
      subtitle: 'View and manage your purchased tickets',
      walletAddress: 'Wallet Address:',
      activeTickets: 'Active Tickets',
      noActiveTickets: 'No active tickets',
      noActiveTicketsDesc: 'Browse events and purchase your first ticket!',
      browseEvents: 'Browse Events',
      owned: 'Owned',
      tokenId: 'Token ID:',
      showQR: 'Show QR',
      refund: 'Refund',
      refundedTickets: 'Refunded Tickets',
      refundedOn: 'Refunded on',
      qrTitle: 'Your Ticket QR Code',
      qrDescription: 'Show this QR code at the venue entrance',
      refundTitle: 'Refund Ticket',
      refundDescription: 'Are you sure you want to refund this ticket?',
      refundAmount: 'Refund Amount:',
      refundNote: 'The ticket will be returned to the platform and made available for other buyers through a random lottery system.',
      cancel: 'Cancel',
      processing: 'Processing...',
      confirmRefund: 'Confirm Refund',
      status: {
        OWNED: 'Owned',
        REFUNDED: 'Refunded',
        RESALE_WAITING: 'Pending Resale',
      },
    },
  },

  ko: {
    // Navbar
    nav: {
      events: '이벤트',
      myTickets: '내 티켓',
      login: '로그인',
      register: '회원가입',
      logout: '로그아웃',
    },

    // Home Page
    home: {
      badge: '블록체인 보안 기술',
      title: '정가로 구매하는 티켓',
      subtitle: '암표 없는 세상',
      description: 'TicketGuard는 블록체인 기술로 티켓 암표와 사기를 원천 차단합니다. 언제나 정가로 티켓을 구매하세요.',
      browseEvents: '공연/전시 둘러보기',
      getStarted: '회원 가입',

      // Features
      howItWorks: '작동 원리',
      featuresSubtitle: '블록체인 기반의 혁신적인 암표 방지 기술',

      feature1Title: '거래 제한',
      feature1Desc: 'NFT 티켓은 개인 간 양도가 불가능하여 불법 재판매를 원천 차단합니다.',

      feature2Title: '공정한 환불',
      feature2Desc: '티켓을 정가로 플랫폼에 반환할 수 있습니다. 웃돈도, 암표도 없습니다.',

      feature3Title: '랜덤 추첨',
      feature3Desc: '환불된 티켓은 대기자에게 공정한 무작위 추첨을 통해 정가로 재판매됩니다.',

      feature4Title: '지갑 불필요',
      feature4Desc: '블록체인 지갑은 저희가 관리합니다. MetaMask 같은 외부 지갑 없이 이메일 로그인만으로 간편하게 이용하세요.',

      // CTA
      ctaTitle: '공정한 티켓팅을 경험할 준비가 되셨나요?',
      ctaDescription: '암표상에게 웃돈을 지불하지 않고 티켓을 구매한 수천 명의 사용자와 함께하세요.',
      ctaButton: '공연/전시 보러가기',
    },

    // Events Page
    events: {
      title: '다가오는 공연/전시',
      subtitle: '콘서트, 페스티벌 등의 티켓을 둘러보고 구매하세요',
      available: '남음',
      soldOut: '매진',
      almostSoldOut: '매진 임박',
      viewDetails: '자세히 보기',
      perTicket: '티켓 당',
    },

    // Event Detail Page
    eventDetail: {
      backToEvents: '공연/전시 목록으로',
      eventNotFound: '공연을 찾을 수 없습니다',
      failedToLoad: '공연 정보를 불러오는데 실패했습니다',
      aboutEvent: '공연 소개',
      ticketInfo: '티켓 정보',
      price: '가격',
      availability: '예매 가능',
      ticketsAvailable: '티켓 남음',
      purchaseTicket: '티켓 구매',
      purchasing: '처리 중...',
      antiScalpingTitle: '스캘핑 방지 보호',
      antiScalpingDesc: '이 티켓은 블록체인 기술로 보호되어 암표상에게 재판매할 수 없습니다.',
      transferRestriction: '거래 제한',
      transferDesc: 'NFT 티켓은 사용자 간 양도 불가',
      fairRefund: '공정한 환불',
      refundDesc: '플랫폼에 정가로 반환 가능',
      randomLottery: '랜덤 추첨',
      lotteryDesc: '환불된 티켓은 공정하게 재분배',
    },

    // Auth
    auth: {
      loginTitle: '다시 오셨군요',
      loginSubtitle: '이메일을 입력하여 계정에 로그인하세요',
      registerTitle: '계정 만들기',
      registerSubtitle: '이메일을 입력하여 계정을 만드세요',
      email: '이메일',
      password: '비밀번호',
      emailPlaceholder: 'you@example.com',
      passwordPlaceholder: '비밀번호를 입력하세요',
      loginButton: '로그인',
      signingIn: '로그인 중...',
      registerButton: '계정 만들기',
      creatingAccount: '계정 생성 중...',
      noAccount: '계정이 없으신가요?',
      hasAccount: '이미 계정이 있으신가요?',
      registerNow: '지금 가입하기',
      signInNow: '로그인하기',
      demoNote: '데모: 시스템을 테스트하려면 아무 이메일과 비밀번호를 사용하세요. 지갑이 자동으로 생성됩니다!',
      confirmPassword: '비밀번호 확인',
      createPasswordPlaceholder: '비밀번호를 새로 입력하세요',
      confirmPasswordPlaceholder: '비밀번호를 다시 입력하세요',
      passwordMismatch: '비밀번호가 일치하지 않습니다',
      passwordTooShort: '비밀번호는 최소 6자 이상이어야 합니다',
      registrationFailed: '회원가입에 실패했습니다. 다시 시도해주세요.',
      walletFreeTitle: '지갑 없이 이용 가능',
      walletFreeDesc: '블록체인 지갑을 자동으로 생성하고 관리해드립니다. 암호화폐 지식이 필요 없습니다!',
      orContinueWith: '또는 다른 방법으로 계속하기',
      googleSignIn: 'Google 계정으로 로그인',
      googleRegister: 'Google 계정으로 회원가입',
    },

    // My Tickets
    myTickets: {
      title: '내 티켓',
      subtitle: '구매한 티켓을 확인하고 관리하세요',
      walletAddress: '지갑 주소:',
      activeTickets: '활성 티켓',
      noActiveTickets: '활성 티켓 없음',
      noActiveTicketsDesc: '이벤트를 둘러보고 첫 티켓을 구매하세요!',
      browseEvents: '이벤트 둘러보기',
      owned: '소유 중',
      tokenId: '토큰 ID:',
      showQR: 'QR 보기',
      refund: '환불',
      refundedTickets: '환불된 티켓',
      refundedOn: '환불일자',
      qrTitle: '티켓 QR 코드',
      qrDescription: '공연장 입구에서 이 QR 코드를 보여주세요',
      refundTitle: '티켓 환불',
      refundDescription: '정말 이 티켓을 환불하시겠습니까?',
      refundAmount: '환불 금액:',
      refundNote: '티켓은 플랫폼으로 반환되며, 무작위 추첨을 통해 다른 구매자에게 판매됩니다.',
      cancel: '취소',
      processing: '처리 중...',
      confirmRefund: '환불 확인',
      status: {
        OWNED: '소유 중',
        REFUNDED: '환불됨',
        RESALE_WAITING: '재판매 대기',
      },
    },
  },
};

export function useTranslation(lang: Language) {
  return translations[lang];
}
