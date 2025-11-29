'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Ticket, User, LogOut, Languages, Shield, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore, useLanguageStore } from '@/lib/store';
import { useTranslation } from '@/lib/translations';
import { useSession, signOut } from 'next-auth/react';

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const authStore = useAuthStore();
  const { language, setLanguage } = useLanguageStore();
  const t = useTranslation(language);

  // NextAuth 또는 Zustand 중 하나라도 인증되어 있으면 인증된 것으로 간주
  const isAuthenticated = !!session || authStore.isAuthenticated;
  const user = session?.user || authStore.user;

  const isActive = (path: string) => pathname === path;

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ko' : 'en');
  };

  const handleLogout = () => {
    // Zustand store 로그아웃
    authStore.logout();
    // NextAuth 로그아웃 (Google OAuth 사용자인 경우)
    if (session) {
      signOut({ callbackUrl: '/' });
    } else {
      // Zustand만 사용한 경우 직접 리다이렉트
      window.location.href = '/';
    }
  };

  return (
    <nav className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-primary rounded-sm group-hover:rounded-md transition-all">
              <Ticket className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">TicketGuard</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-1">
            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="gap-2 font-medium"
            >
              <Languages className="h-4 w-4" />
              {language === 'en' ? '한국어' : 'English'}
            </Button>

            <Link href="/events">
              <Button
                variant={isActive('/events') ? 'default' : 'ghost'}
                className="font-medium"
              >
                {t.nav.events}
              </Button>
            </Link>

            <Link href="/demo">
              <Button
                variant={isActive('/demo') ? 'default' : 'ghost'}
                className="font-medium gap-2"
              >
                <Shield className="h-4 w-4" />
                {language === 'ko' ? '데모' : 'Demo'}
              </Button>
            </Link>

            {isAuthenticated ? (
              <>
                <Link href="/my-tickets">
                  <Button
                    variant={isActive('/my-tickets') ? 'default' : 'ghost'}
                    className="font-medium gap-2"
                  >
                    <Ticket className="h-4 w-4" />
                    {t.nav.myTickets}
                  </Button>
                </Link>

                <Link href="/admin">
                  <Button
                    variant={isActive('/admin') ? 'default' : 'ghost'}
                    className="font-medium gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    {language === 'ko' ? '관리자' : 'Admin'}
                  </Button>
                </Link>

                <div className="ml-4 flex items-center gap-3 pl-4 border-l">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{user?.email}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    {t.nav.logout}
                  </Button>
                </div>
              </>
            ) : (
              <div className="ml-4 flex items-center gap-2 pl-4 border-l">
                <Link href="/login">
                  <Button variant="ghost" className="font-medium">
                    {t.nav.login}
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="font-medium">{t.nav.register}</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
