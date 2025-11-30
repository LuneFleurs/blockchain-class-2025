'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useAuthStore } from '@/lib/store';

/**
 * NextAuth 세션과 Zustand 스토어를 동기화하는 컴포넌트
 * Google OAuth 로그인 시 백엔드 JWT를 Zustand에 저장
 */
export function SessionSync() {
  const { data: session, status } = useSession();
  const { setAuth, logout } = useAuthStore();

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const user = session.user as any;

      // NextAuth 세션이 있으면 Zustand 스토어에 동기화
      if (user.accessToken) {
        setAuth({
          user: {
            id: user.id,
            email: user.email || '',
            walletAddress: user.walletAddress,
            role: user.role,
          },
          accessToken: user.accessToken,
        });
      }
    }
    // 중요: NextAuth session이 없어도 Zustand에 인증 정보가 있을 수 있음 (일반 로그인)
    // 따라서 NextAuth 'unauthenticated' 상태에서 자동으로 logout하지 않음
  }, [session, status, setAuth]);

  return null; // UI를 렌더링하지 않음
}
