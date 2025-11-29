'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Shield, Lock, Ticket, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguageStore } from '@/lib/store';
import { useTranslation } from '@/lib/translations';

export default function Home() {
  const { language } = useLanguageStore();
  const t = useTranslation(language);
  return (
    <div className="flex flex-col font-sans">
      {/* Hero Section - Full Background Image */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        {/* Background Image - Covers entire section */}
        <div className="absolute inset-0">
          <Image
            src="/landingImg.png"
            alt="Concert Event"
            fill
            className="object-cover"
            priority
          />
          {/* Dark Overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40"></div>
        </div>

        {/* Content on top of image */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-orange-500 text-white px-3 py-1.5 text-xs font-bold tracking-wide uppercase mb-8">
              <Shield className="h-3.5 w-3.5" />
              {language === 'ko' ? '안전한 티켓팅' : 'Secure Ticketing'}
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight mb-6">
              {language === 'ko' ? (
                <>
                  암표 걱정 없는<br />
                  <span className="text-orange-400">공정한 티켓</span>
                </>
              ) : (
                <>
                  No More Scalpers,<br />
                  <span className="text-orange-400">Fair Tickets</span>
                </>
              )}
            </h1>

            <p className="text-xl text-slate-200 leading-relaxed mb-8">
              {language === 'ko'
                ? '블록체인 기술로 암표 거래를 원천 차단하고, 모두에게 공정한 티켓 구매 기회를 제공합니다.'
                : 'Blockchain technology eliminates scalping and provides fair ticket purchasing opportunities for everyone.'}
            </p>

            {/* Benefits List */}
            <div className="space-y-3 mb-10">
              <div className="flex items-center gap-3 text-white">
                <CheckCircle className="h-5 w-5 text-orange-400 flex-shrink-0" />
                <span className="text-sm font-medium">{language === 'ko' ? 'P2P 전송 불가능 - 암표 방지' : 'No P2P Transfer - Prevents Scalping'}</span>
              </div>
              <div className="flex items-center gap-3 text-white">
                <CheckCircle className="h-5 w-5 text-orange-400 flex-shrink-0" />
                <span className="text-sm font-medium">{language === 'ko' ? '환불 시 자동 재추첨 시스템' : 'Automatic Re-lottery on Refunds'}</span>
              </div>
              <div className="flex items-center gap-3 text-white">
                <CheckCircle className="h-5 w-5 text-orange-400 flex-shrink-0" />
                <span className="text-sm font-medium">{language === 'ko' ? '지갑 설정 불필요 - 간편 이용' : 'No Wallet Setup - Easy Access'}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link href="/events">
                <Button size="lg" className="text-base px-8 h-14 bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-xl">
                  {language === 'ko' ? '공연 둘러보기' : 'Browse Events'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" className="text-base px-8 h-14 bg-white text-black hover:bg-slate-100 font-bold border-2 border-white">
                  {language === 'ko' ? '무료로 시작' : 'Get Started Free'}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section - Asymmetric Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-slate-900">
              {language === 'ko' ? '왜 TicketGuard인가요?' : 'Why TicketGuard?'}
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl">
              {language === 'ko'
                ? '티켓 시장의 불공정을 기술로 해결합니다'
                : 'Solving unfairness in the ticket market with technology'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1 - Different heights and styles */}
            <Card className="border-2 border-slate-200 hover:border-orange-400 transition-colors bg-slate-50">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-orange-500 flex items-center justify-center mb-6">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-xl mb-3 text-slate-900">
                  {language === 'ko' ? '전송 불가능한 NFT' : 'Non-Transferable NFTs'}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {language === 'ko'
                    ? '스마트 컨트랙트로 P2P 전송을 완전히 차단합니다. 암표상이 개입할 수 없습니다.'
                    : 'Smart contracts completely block P2P transfers. Scalpers cannot intervene.'}
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-slate-200 hover:border-orange-400 transition-colors lg:col-span-2 bg-orange-50">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-slate-900 flex items-center justify-center mb-6 rounded-none">
                  <Ticket className="h-6 w-6 text-orange-400" />
                </div>
                <h3 className="font-bold text-xl mb-3 text-slate-900">
                  {language === 'ko' ? '자동 재추첨 시스템' : 'Automatic Re-lottery'}
                </h3>
                <p className="text-slate-600 leading-relaxed max-w-xl">
                  {language === 'ko'
                    ? '환불이 발생하면 대기자 중 가장 먼저 등록한 사람에게 자동으로 티켓이 전달됩니다. 모두에게 공정한 기회를 제공합니다.'
                    : 'When a refund occurs, the ticket automatically goes to the first person on the waitlist. Fair opportunities for everyone.'}
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-slate-200 hover:border-orange-400 transition-colors lg:col-span-2 bg-slate-900 text-white">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-orange-500 flex items-center justify-center mb-6 rounded-sm">
                  <Lock className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-xl mb-3">
                  {language === 'ko' ? '지갑 없이 간편하게' : 'No Wallet Needed'}
                </h3>
                <p className="text-slate-300 leading-relaxed max-w-xl">
                  {language === 'ko'
                    ? '복잡한 블록체인 지갑 설정이 필요 없습니다. 이메일 로그인만으로 NFT 티켓을 소유할 수 있습니다.'
                    : 'No complex blockchain wallet setup required. Own NFT tickets with just email login.'}
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-orange-400 bg-orange-500 text-white">
              <CardContent className="p-8 flex flex-col justify-between h-full">
                <div>
                  <h3 className="font-bold text-2xl mb-3">
                    {language === 'ko' ? '가스비 무료' : 'Free Gas Fees'}
                  </h3>
                  <p className="text-orange-50 leading-relaxed">
                    {language === 'ko'
                      ? '블록체인 수수료는 저희가 부담합니다'
                      : 'We cover blockchain fees'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section - Bold Dark Design */}
      <section className="bg-slate-900 py-20 border-t-4 border-orange-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
              {language === 'ko' ? '공정한 티켓 시장을 함께 만들어요' : "Let's Build a Fair Ticket Market Together"}
            </h2>
            <p className="text-xl text-slate-300 mb-10 leading-relaxed">
              {language === 'ko'
                ? '암표상 없는 세상, TicketGuard와 함께 시작하세요.'
                : 'A world without scalpers starts with TicketGuard.'}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/events">
                <Button size="lg" className="text-base px-10 h-14 bg-orange-500 hover:bg-orange-600 text-white font-bold">
                  {language === 'ko' ? '공연 보러가기' : 'Browse Events'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
