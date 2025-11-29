'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Shield, 
  XCircle, 
  CheckCircle, 
  ArrowLeft, 
  Code, 
  ExternalLink, 
  AlertTriangle, 
  Ticket,
  ArrowRight,
  Lock,
  Terminal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguageStore } from '@/lib/store';
import { toast } from 'sonner';
import { Highlight, themes } from "prism-react-renderer";

const SMART_CONTRACT_CODE = `function _update(
    address to,
    uint256 tokenId,
    address auth
) internal override returns (address) {
    address from = _ownerOf(tokenId);

    // 1. Allow Minting (Creation)
    if (from == address(0)) {
        return super._update(to, tokenId, auth);
    }

    // 2. Allow Burn (Destruction)
    if (to == address(0)) {
        return super._update(to, tokenId, auth);
    }

    // 3. Allow Refund (Return to Admin)
    if (to == owner()) {
        return super._update(to, tokenId, auth);
    }

    // 🛑 4. BLOCK ALL P2P TRANSFERS
    revert("P2P transfer is not allowed.");
}`;

export default function DemoPage() {
  const { language } = useLanguageStore();
  const [attemptingTransfer, setAttemptingTransfer] = useState(false);
  const [transferFailed, setTransferFailed] = useState(false);

  const handleAttemptTransfer = async () => {
    setAttemptingTransfer(true);
    setTransferFailed(false);

    // 실제 전송 시도를 시뮬레이션 (2초 후 실패)
    setTimeout(() => {
      setTransferFailed(true);
      setAttemptingTransfer(false);
      toast.error(language === 'ko' ? '전송 실패: 스마트 컨트랙트에 의해 차단됨' : 'Transfer Failed: Blocked by Smart Contract');
    }, 2000);
  };

  const resetDemo = () => {
    setTransferFailed(false);
    setAttemptingTransfer(false);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950">
      {/* Top Navigation */}
      <header className="border-b bg-white dark:bg-slate-900 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {language === 'ko' ? '메인으로 돌아가기' : 'Back to Main'}
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {language === 'ko' ? '기술 증명: 스캘핑 방지' : 'Technical Proof: Anti-Scalping'}
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
            {language === 'ko'
              ? '블록체인 스마트 컨트랙트가 어떻게 비정상적인 티켓 이동을 원천 차단하는지 직접 확인하세요.'
              : 'Experience firsthand how blockchain smart contracts fundamentally block abnormal ticket movements.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Interactive Demo */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="overflow-hidden border-slate-200 dark:border-slate-800 shadow-sm">
              <CardHeader className="bg-transparent border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Ticket className="h-5 w-5 text-orange-500" />
                      {language === 'ko' ? '나의 NFT 티켓' : 'My NFT Ticket'}
                    </CardTitle>
                    <CardDescription>
                      {language === 'ko' ? '현재 보유 중인 디지털 자산' : 'Currently held digital asset'}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900">
                    Owned
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {/* Ticket Visual */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                  <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-xl text-slate-900 dark:text-slate-100">BTS World Tour 2025</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Seoul Olympic Stadium</p>
                      </div>
                      <div className="text-right">
                        <span className="block text-xs font-mono text-slate-400">TOKEN ID</span>
                        <span className="block font-mono font-bold text-slate-700 dark:text-slate-300">#8291</span>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-dashed border-slate-200 dark:border-slate-800 flex justify-between items-end">
                      <div className="space-y-1">
                        <span className="text-xs text-slate-500 uppercase tracking-wider">Owner</span>
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span className="font-mono text-sm text-slate-700 dark:text-slate-300">0x742...5f0b</span>
                        </div>
                      </div>
                      <Shield className="h-8 w-8 text-slate-200 dark:text-slate-700" />
                    </div>
                  </div>
                </div>

                {/* Transfer Control */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between text-sm">
                    <Label className="text-slate-600 dark:text-slate-400">
                      {language === 'ko' ? '전송할 주소 (해커/구매자)' : 'Recipient Address (Hacker/Buyer)'}
                    </Label>
                  </div>
                  <div className="relative">
                    <Input 
                      value="0x1234567890abcdef1234567890abcdef12345678" 
                      readOnly 
                      className="font-mono text-xs bg-slate-50 dark:bg-slate-900 text-slate-500 border-slate-200 pr-10"
                    />
                    <Lock className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
                  </div>
                  
                  {!transferFailed ? (
                    <Button 
                      className="w-full h-11 font-medium bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:text-white"
                      onClick={handleAttemptTransfer}
                      disabled={attemptingTransfer}
                    >
                      {attemptingTransfer ? (
                        <>
                          <span className="animate-spin mr-2">⏳</span>
                          {language === 'ko' ? '블록체인 승인 대기중...' : 'Awaiting Blockchain Confirmation...'}
                        </>
                      ) : (
                        <>
                          {language === 'ko' ? '무단 전송 시도하기' : 'Attempt Unauthorized Transfer'}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="w-full h-11 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/20"
                      onClick={resetDemo}
                    >
                      {language === 'ko' ? '데모 초기화' : 'Reset Demo'}
                    </Button>
                  )}
                </div>

                {/* Error State */}
                {transferFailed && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 p-4">
                    <div className="flex gap-3">
                      <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <h4 className="text-sm font-semibold text-red-900 dark:text-red-200">
                          {language === 'ko' ? '트랜잭션 차단됨' : 'Transaction Reverted'}
                        </h4>
                        <p className="text-sm text-red-700 dark:text-red-300">
                          {language === 'ko' 
                            ? '스마트 컨트랙트 정책 위반: P2P 전송은 허용되지 않습니다.' 
                            : 'Smart Contract Policy Violation: P2P transfers are not allowed.'}
                        </p>
                        <div className="mt-2 pt-2 border-t border-red-200 dark:border-red-800/50">
                          <code className="text-xs font-mono text-red-800 dark:text-red-300 block">
                            Error: execution reverted: "P2P transfer is not allowed."
                          </code>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

             <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900 rounded-lg p-4 flex gap-3">
                <Terminal className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <div className="text-sm text-blue-800 dark:text-blue-300">
                  <p className="font-semibold mb-1">
                    {language === 'ko' ? '실제 환경에서는?' : 'In Real Environment?'}
                  </p>
                  <p className="leading-relaxed opacity-90">
                    {language === 'ko' 
                      ? '사용자는 "전송" 버튼조차 볼 수 없습니다. 이 데모는 해커가 코드를 조작하여 강제로 전송 함수를 호출했을 때 블록체인이 이를 어떻게 막아내는지 보여줍니다.'
                      : 'Users won\'t even see a "Transfer" button. This demo simulates how the blockchain rejects a forced transfer attempt by a hacker.'}
                  </p>
                </div>
             </div>
          </div>

          {/* Right Column: Technical Details */}
          <div className="lg:col-span-7">
            <Tabs defaultValue="code" className="w-full">
              <TabsList className="w-full grid grid-cols-3 mb-4">
                <TabsTrigger value="code">Code</TabsTrigger>
                <TabsTrigger value="logic">Logic</TabsTrigger>
                <TabsTrigger value="comparison">Comparison</TabsTrigger>
              </TabsList>
              
              <TabsContent value="code" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                      <Code className="h-4 w-4 text-slate-500" />
                      Smart Contract (Solidity)
                    </CardTitle>
                    <CardDescription>
                      contracts/TicketNFT.sol
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0 bg-slate-950 dark:bg-black rounded-b-lg overflow-hidden">
                    <div className="flex">
                      <div className="w-12 bg-slate-900 text-slate-600 text-xs font-mono py-3 flex flex-col items-end pr-3 select-none leading-6">
                        {Array.from({length: 25}).map((_, i) => <span key={i}>{i + 85}</span>)}
                      </div>
                      <Highlight
                        theme={themes.oneDark}
                        code={SMART_CONTRACT_CODE}
                        language="typescript"
                      >
                        {({ className, style, tokens, getLineProps, getTokenProps }) => (
                          <pre className="flex-1 p-3 text-xs font-mono overflow-x-auto leading-6" style={{ ...style, backgroundColor: 'transparent' }}>
                            {tokens.map((line, i) => (
                              <div key={i} {...getLineProps({ line })} className="leading-6">
                                {line.map((token, key) => (
                                  <span key={key} {...getTokenProps({ token })} />
                                ))}
                              </div>
                            ))}
                          </pre>
                        )}
                      </Highlight>
                    </div>
                  </CardContent>
                </Card>
                <p className="text-sm text-slate-500 px-1">
                  {language === 'ko' 
                    ? '이 코드는 블록체인에 영구적으로 기록되며, 개발자조차 배포 후에는 수정할 수 없습니다.'
                    : 'This code is permanently recorded on the blockchain and cannot be modified even by the developer after deployment.'}
                </p>
              </TabsContent>

              <TabsContent value="logic" className="space-y-4">
                 <Card>
                  <CardHeader>
                    <CardTitle>How it works</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">1</div>
                        <div className="w-0.5 h-full bg-slate-200 my-2"></div>
                      </div>
                      <div className="pb-6">
                        <h4 className="font-semibold text-slate-900 dark:text-slate-100">Transaction Request</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          {language === 'ko' 
                            ? '사용자(또는 해커)가 지갑에서 티켓 전송 요청을 보냅니다.'
                            : 'User (or hacker) initiates a ticket transfer request from their wallet.'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm">2</div>
                        <div className="w-0.5 h-full bg-slate-200 my-2"></div>
                      </div>
                      <div className="pb-6">
                        <h4 className="font-semibold text-slate-900 dark:text-slate-100">Validation Logic</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          {language === 'ko' 
                            ? '스마트 컨트랙트의 `_update` 함수가 자동으로 실행되어 수신자 주소(to)를 검사합니다.'
                            : 'The `_update` function in the smart contract triggers automatically to inspect the recipient address (to).'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-sm">3</div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-slate-100">Block & Revert</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          {language === 'ko' 
                            ? '수신자가 관리자(환불)가 아니라면 거래를 즉시 취소(Revert)하고 가스비를 소모시킵니다.'
                            : 'If the recipient is not the admin (refund), the transaction is immediately reverted, consuming gas fees.'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="comparison">
                <div className="grid gap-4">
                  <Card className="border-l-4 border-l-red-500">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base text-red-700 dark:text-red-400">
                        {language === 'ko' ? '기존 티켓 시스템' : 'Traditional Tickets'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                      <div className="flex items-start gap-2">
                        <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
                        <span>
                          {language === 'ko' 
                            ? '무제한 재판매 허용 (암표 조장)' 
                            : 'Unlimited Resale (Scalping Friendly)'}
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
                        <span>
                          {language === 'ko' 
                            ? '위조 티켓 및 중복 입장 위험' 
                            : 'Fake Tickets & Duplicates'}
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
                        <span>
                          {language === 'ko' 
                            ? '가격 통제 불가능 (프리미엄)' 
                            : 'No Price Control'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-green-500 bg-green-50/30 dark:bg-green-900/10">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base text-green-700 dark:text-green-400">TicketGuard (NFT)</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <span>
                          {language === 'ko' 
                            ? <><strong>전송 불가능</strong> (SBT 메커니즘)</> 
                            : <><strong>Non-Transferable</strong> (SBT Mechanism)</>}
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <span>
                          {language === 'ko' 
                            ? '100% 정품 인증 보장' 
                            : '100% Authenticity Guaranteed'}
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <span>
                          {language === 'ko' 
                            ? '공식 환불 및 재판매 시스템만 허용' 
                            : 'Official Refund & Resale System Only'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
