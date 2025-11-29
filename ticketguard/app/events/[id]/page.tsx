'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Calendar, MapPin, Users, ArrowLeft, Shield, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { eventsAPI, ticketsAPI, waitlistAPI } from '@/lib/api';
import { useAuthStore, useLanguageStore } from '@/lib/store';
import { useTranslation } from '@/lib/translations';
import { Event } from '@/lib/types';
import { toast } from 'sonner';

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { language } = useLanguageStore();
  const t = useTranslation(language);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState('');
  const [isHydrated, setIsHydrated] = useState(false);
  const [waitlistStatus, setWaitlistStatus] = useState<any>(null);
  const [waitlistLoading, setWaitlistLoading] = useState(false);

  // Zustand persist hydration 처리
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // hydration 완료 후 인증 상태 가져오기
  const authStore = useAuthStore();
  const isAuthenticated = isHydrated ? authStore.isAuthenticated : false;

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const data = await eventsAPI.getById(id);
        setEvent(data);
      } catch (err) {
        console.error('Failed to fetch event:', err);
        setError(t.eventDetail.failedToLoad);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, t]);

  // 대기열 상태 조회 및 실시간 폴링
  useEffect(() => {
    if (!isAuthenticated || !event) return;

    const fetchWaitlistStatus = async () => {
      try {
        const status = await waitlistAPI.getStatus(event.id);

        // 이전 상태가 WAITING이었는데 null로 변경 = 티켓 받음!
        if (waitlistStatus?.status === 'WAITING' && !status) {
          // 🎉 티켓 자동 수령 알림
          toast.success(
            language === 'ko' ? '🎉 티켓 당첨!' : '🎉 You Got the Ticket!',
            {
              description: language === 'ko'
                ? '환불이 발생하여 자동으로 티켓을 받았습니다! "내 티켓" 페이지로 이동합니다.'
                : 'A refund occurred and you automatically received a ticket! Redirecting to My Tickets.',
              duration: 5000,
            }
          );

          // 3초 후 내 티켓 페이지로 이동
          setTimeout(() => {
            router.push('/my-tickets');
          }, 3000);
        }

        setWaitlistStatus(status);
      } catch (error) {
        // 대기열에 없으면 null 반환됨 (정상)
        setWaitlistStatus(null);
      }
    };

    // 초기 조회
    fetchWaitlistStatus();

    // 대기열에 있으면 5초마다 상태 확인 (실시간 폴링)
    let intervalId: NodeJS.Timeout | null = null;

    if (waitlistStatus?.status === 'WAITING') {
      intervalId = setInterval(() => {
        fetchWaitlistStatus();
      }, 5000); // 5초마다 확인
    }

    // 컴포넌트 언마운트 또는 대기열 상태 변경 시 인터벌 정리
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isAuthenticated, event, waitlistStatus?.status, language, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{error || t.eventDetail.eventNotFound}</h1>
          <Link href="/events">
            <Button>{t.eventDetail.backToEvents}</Button>
          </Link>
        </div>
      </div>
    );
  }

  const soldOut = event.availableTickets === 0;
  const almostSoldOut = event.availableTickets < event.totalTickets * 0.1 && !soldOut;

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    setPurchasing(true);

    try {
      await ticketsAPI.buy(event.id);

      // 성공 알림
      toast.success(
        language === 'ko' ? '🎉 티켓 구매 완료!' : '🎉 Purchase Successful!',
        {
          description: language === 'ko'
            ? 'NFT 티켓이 발급되었습니다. "내 티켓" 페이지에서 확인하세요.'
            : 'Your NFT ticket has been issued. Check "My Tickets" page.',
          duration: 5000,
        }
      );

      // 잠시 대기 후 페이지 이동 (토스트를 볼 시간 제공)
      setTimeout(() => {
        router.push('/my-tickets');
      }, 1500);
    } catch (error) {
      console.error('Purchase failed:', error);
      toast.error(
        language === 'ko' ? '티켓 구매 실패' : 'Purchase Failed',
        {
          description: language === 'ko'
            ? '티켓 구매 중 오류가 발생했습니다. 다시 시도해주세요.'
            : 'An error occurred while purchasing the ticket. Please try again.',
          duration: 5000,
        }
      );
      setPurchasing(false);
    }
  };

  const handleJoinWaitlist = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    setWaitlistLoading(true);

    try {
      const result = await waitlistAPI.join(event!.id);
      setWaitlistStatus(result);

      toast.success(
        language === 'ko' ? '🎟️ 대기열 등록 완료!' : '🎟️ Joined Waitlist!',
        {
          description: language === 'ko'
            ? `대기 순번: ${result.position}번. 환불 발생 시 자동으로 티켓을 받게 됩니다.`
            : `Position: #${result.position}. You'll get a ticket automatically when someone refunds.`,
          duration: 5000,
        }
      );
    } catch (error: any) {
      console.error('Failed to join waitlist:', error);
      console.error('Error response:', error.response?.data);

      const errorMessage = error.response?.data?.message || error.response?.data?.error || (language === 'ko'
        ? '대기열 등록 중 오류가 발생했습니다.'
        : 'An error occurred while joining the waitlist.');

      toast.error(
        language === 'ko' ? '대기열 등록 실패' : 'Failed to Join Waitlist',
        {
          description: errorMessage,
          duration: 5000,
        }
      );
    } finally {
      setWaitlistLoading(false);
    }
  };

  const handleLeaveWaitlist = async () => {
    setWaitlistLoading(true);

    try {
      await waitlistAPI.leave(event!.id);
      setWaitlistStatus(null);

      toast.success(
        language === 'ko' ? '대기열 취소 완료' : 'Left Waitlist',
        {
          description: language === 'ko'
            ? '대기열에서 나왔습니다.'
            : 'You have left the waitlist.',
          duration: 5000,
        }
      );
    } catch (error) {
      console.error('Failed to leave waitlist:', error);
      toast.error(
        language === 'ko' ? '대기열 취소 실패' : 'Failed to Leave Waitlist',
        {
          description: language === 'ko'
            ? '대기열 취소 중 오류가 발생했습니다.'
            : 'An error occurred while leaving the waitlist.',
          duration: 5000,
        }
      );
    } finally {
      setWaitlistLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link href="/events" className="inline-flex items-center gap-2 mb-8 hover:underline">
          <ArrowLeft className="h-4 w-4" />
          {t.eventDetail.backToEvents}
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Event Image & Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-200">
              {event.imageUrl && (
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              )}
              {soldOut && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <Badge variant="secondary" className="text-2xl px-6 py-3">
                    {t.events.soldOut}
                  </Badge>
                </div>
              )}
              {almostSoldOut && !soldOut && (
                <Badge className="absolute top-4 right-4 bg-red-600 text-base px-4 py-2">
                  {t.events.almostSoldOut}
                </Badge>
              )}
            </div>

            <div>
              <h1 className="text-4xl font-bold mb-4">{event.title}</h1>

              <div className="space-y-3 text-muted-foreground">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5" />
                  <span className="text-lg">
                    {format(new Date(event.date), 'EEEE, MMMM dd, yyyy • h:mm a')}
                  </span>
                </div>
                {event.location && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5" />
                    <span className="text-lg">{event.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5" />
                  <span className="text-lg">
                    {event.availableTickets.toLocaleString()} / {event.totalTickets.toLocaleString()} {t.eventDetail.ticketsAvailable}
                  </span>
                </div>
              </div>
            </div>

            {event.description && (
              <div className="prose max-w-none">
                <h2 className="text-2xl font-bold mb-3">{t.eventDetail.aboutEvent}</h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  {event.description}
                </p>
              </div>
            )}

            <Card className="bg-slate-50 border-2">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <Shield className="h-6 w-6 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-lg mb-2">{t.eventDetail.antiScalpingTitle}</h3>
                    <p className="text-muted-foreground">
                      {t.eventDetail.antiScalpingDesc}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Purchase Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">
                      {t.eventDetail.price}
                    </div>
                    <div className="text-4xl font-bold">
                      ₩{event.price.toLocaleString()}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {language === 'ko' ? '서비스 수수료' : 'Service fee'}
                      </span>
                      <span className="font-medium">₩0</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {language === 'ko' ? '가스비' : 'Gas fee'}
                      </span>
                      <span className="font-medium">
                        {language === 'ko' ? '₩0 (저희가 부담합니다!)' : '₩0 (We cover it!)'}
                      </span>
                    </div>
                    <div className="pt-3 border-t flex justify-between">
                      <span className="font-semibold">
                        {language === 'ko' ? '합계' : 'Total'}
                      </span>
                      <span className="text-2xl font-bold">
                        ₩{event.price.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* 대기열 상태 표시 */}
                  {waitlistStatus && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="default">{language === 'ko' ? '대기 중' : 'Waiting'}</Badge>
                        <span className="text-sm font-medium">
                          {language === 'ko' ? `순번: ${waitlistStatus.position}번` : `Position: #${waitlistStatus.position}`}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {language === 'ko'
                          ? '환불 발생 시 자동으로 티켓을 받게 됩니다.'
                          : "You'll get a ticket automatically when someone refunds."}
                      </p>
                    </div>
                  )}

                  {/* 버튼 로직 */}
                  {!soldOut ? (
                    // 티켓 구매 가능
                    <Button
                      size="lg"
                      className="w-full"
                      onClick={handlePurchase}
                      disabled={purchasing}
                    >
                      {purchasing ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          {t.eventDetail.purchasing}
                        </>
                      ) : (
                        t.eventDetail.purchaseTicket
                      )}
                    </Button>
                  ) : waitlistStatus ? (
                    // 대기열에 등록되어 있음 - 나가기 버튼
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full"
                      onClick={handleLeaveWaitlist}
                      disabled={waitlistLoading}
                    >
                      {waitlistLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          {language === 'ko' ? '처리 중...' : 'Processing...'}
                        </>
                      ) : (
                        language === 'ko' ? '대기열 나가기' : 'Leave Waitlist'
                      )}
                    </Button>
                  ) : (
                    // 매진 - 대기열 등록 버튼
                    <Button
                      size="lg"
                      className="w-full"
                      onClick={handleJoinWaitlist}
                      disabled={waitlistLoading}
                    >
                      {waitlistLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          {language === 'ko' ? '처리 중...' : 'Processing...'}
                        </>
                      ) : (
                        language === 'ko' ? '🎟️ 대기열 신청' : '🎟️ Join Waitlist'
                      )}
                    </Button>
                  )}

                  {!isAuthenticated && (
                    <p className="text-sm text-muted-foreground text-center">
                      {language === 'ko' ? '로그인 페이지로 이동합니다' : "You'll be redirected to login"}
                    </p>
                  )}

                  <div className="pt-4 space-y-2 text-sm text-muted-foreground">
                    <p>✓ {language === 'ko' ? '즉시 NFT 발급' : 'Instant NFT delivery'}</p>
                    <p>✓ {language === 'ko' ? '지갑 설정 불필요' : 'No wallet setup required'}</p>
                    <p>✓ {language === 'ko' ? '공연 전 언제든 환불 가능' : 'Full refund anytime before event'}</p>
                    <p>✓ {language === 'ko' ? '암표상으로부터 보호' : 'Protected from scalpers'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
