'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Calendar, MapPin, Hash, Ticket as TicketIcon, QrCode, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuthStore, useLanguageStore } from '@/lib/store';
import { useTranslation } from '@/lib/translations';
import { ticketsAPI } from '@/lib/api';
import { Ticket } from '@/lib/types';
import { QRCodeCanvas } from 'qrcode.react';
import { toast } from 'sonner';

export default function MyTicketsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { language } = useLanguageStore();
  const t = useTranslation(language);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [refunding, setRefunding] = useState(false);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchTickets = async () => {
      try {
        const data = await ticketsAPI.getMy();
        setTickets(data);
      } catch (error) {
        console.error('Failed to fetch tickets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [isAuthenticated, router]);

  const handleRefund = async (ticketId: string) => {
    setRefunding(true);

    try {
      await ticketsAPI.refund(ticketId);

      // Refresh tickets list
      const data = await ticketsAPI.getMy();
      setTickets(data);

      setSelectedTicket(null);

      // 성공 알림
      toast.success(
        language === 'ko' ? '환불 완료' : 'Refund Successful',
        {
          description: language === 'ko'
            ? '티켓이 플랫폼으로 반환되었으며, 환불 금액이 곧 처리됩니다.'
            : 'Your ticket has been returned to the platform and your refund will be processed soon.',
          duration: 5000,
        }
      );
    } catch (error) {
      console.error('Refund failed:', error);
      toast.error(
        language === 'ko' ? '환불 실패' : 'Refund Failed',
        {
          description: language === 'ko'
            ? '환불 처리 중 오류가 발생했습니다. 다시 시도해주세요.'
            : 'An error occurred while processing your refund. Please try again.',
          duration: 5000,
        }
      );
    } finally {
      setRefunding(false);
    }
  };

  const handleShowQR = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setShowQR(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const activeTickets = tickets.filter((t) => t.status === 'OWNED');
  const refundedTickets = tickets.filter((t) => t.status === 'REFUNDED');

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-3">{t.myTickets.title}</h1>
          <p className="text-lg text-muted-foreground">
            {t.myTickets.subtitle}
          </p>
          <div className="mt-4 p-4 bg-white rounded-md border">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">{t.myTickets.walletAddress}</span>
              <code className="bg-slate-100 px-2 py-1 rounded text-xs font-mono">
                {user?.walletAddress || 'No wallet address'}
              </code>
            </div>
          </div>
        </div>

        {/* Active Tickets */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">{t.myTickets.activeTickets} ({activeTickets.length})</h2>

          {activeTickets.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <TicketIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">{t.myTickets.noActiveTickets}</h3>
                <p className="text-muted-foreground mb-6">
                  {t.myTickets.noActiveTicketsDesc}
                </p>
                <Button onClick={() => router.push('/events')}>{t.myTickets.browseEvents}</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {activeTickets.map((ticket) => (
                <Card key={ticket.id} className="overflow-hidden">
                  <div className="relative h-40 bg-slate-200">
                    {ticket.event.imageUrl && (
                      <img
                        src={ticket.event.imageUrl}
                        alt={ticket.event.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <Badge className="absolute top-3 left-3 bg-green-600">
                      {t.myTickets.owned}
                    </Badge>
                  </div>

                  <CardContent className="pt-6">
                    <h3 className="font-bold text-xl mb-3">{ticket.event.title}</h3>

                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {format(new Date(ticket.event.date), 'MMM dd, yyyy • h:mm a')}
                        </span>
                      </div>
                      {ticket.event.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{ticket.event.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4" />
                        <span>{t.myTickets.tokenId} {ticket.tokenId}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        className="flex-1 gap-2"
                        onClick={() => handleShowQR(ticket)}
                      >
                        <QrCode className="h-4 w-4" />
                        {t.myTickets.showQR}
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          setSelectedTicket(ticket);
                          setShowQR(false);
                        }}
                      >
                        {t.myTickets.refund}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Refunded Tickets */}
        {refundedTickets.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">{t.myTickets.refundedTickets} ({refundedTickets.length})</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {refundedTickets.map((ticket) => (
                <Card key={ticket.id} className="opacity-60">
                  <CardContent className="pt-6">
                    <Badge variant="secondary" className="mb-3">
                      {t.myTickets.status.REFUNDED}
                    </Badge>
                    <h3 className="font-bold text-lg">{ticket.event.title}</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      {t.myTickets.refundedOn} {format(new Date(ticket.purchaseDate), 'MMM dd, yyyy')}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* QR Code Dialog */}
        <Dialog open={showQR && selectedTicket !== null} onOpenChange={setShowQR}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t.myTickets.qrTitle}</DialogTitle>
              <DialogDescription>
                {t.myTickets.qrDescription}
              </DialogDescription>
            </DialogHeader>
            {selectedTicket && (
              <div className="space-y-6">
                <div className="flex justify-center p-8 bg-white rounded-lg">
                  <QRCodeCanvas
                    value={JSON.stringify({
                      ticketId: selectedTicket.id,
                      tokenId: selectedTicket.tokenId,
                      userId: user?.id,
                      eventId: selectedTicket.event.id,
                    })}
                    size={256}
                    level="H"
                  />
                </div>
                <div className="text-center space-y-2">
                  <p className="font-bold">{selectedTicket.event.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(selectedTicket.event.date), 'MMMM dd, yyyy • h:mm a')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t.myTickets.tokenId} {selectedTicket.tokenId}
                  </p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Refund Confirmation Dialog */}
        <Dialog
          open={!showQR && selectedTicket !== null}
          onOpenChange={(open) => !open && setSelectedTicket(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t.myTickets.refundTitle}</DialogTitle>
              <DialogDescription>
                {t.myTickets.refundDescription}
              </DialogDescription>
            </DialogHeader>
            {selectedTicket && (
              <div className="space-y-4">
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-bold mb-2">{selectedTicket.event.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {format(new Date(selectedTicket.event.date), 'MMM dd, yyyy • h:mm a')}
                    </p>
                    <div className="flex justify-between text-sm">
                      <span>{t.myTickets.refundAmount}</span>
                      <span className="font-bold">
                        ₩{selectedTicket.event.price.toLocaleString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <div className="bg-slate-50 p-4 rounded-md text-sm">
                  <p className="text-muted-foreground">
                    {t.myTickets.refundNote}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setSelectedTicket(null)}
                    disabled={refunding}
                  >
                    {t.myTickets.cancel}
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => handleRefund(selectedTicket.id)}
                    disabled={refunding}
                  >
                    {refunding ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        {t.myTickets.processing}
                      </>
                    ) : (
                      t.myTickets.confirmRefund
                    )}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
