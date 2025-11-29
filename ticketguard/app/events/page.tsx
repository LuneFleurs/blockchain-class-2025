'use client';

import { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Ticket, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { eventsAPI } from '@/lib/api';
import { useLanguageStore } from '@/lib/store';
import { useTranslation } from '@/lib/translations';
import { Event } from '@/lib/types';

export default function EventsPage() {
  const { language } = useLanguageStore();
  const t = useTranslation(language);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await eventsAPI.getAll();
        setEvents(data);
      } catch (err) {
        console.error('Failed to fetch events:', err);
        setError('Failed to load events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-3">{t.events.title}</h1>
          <p className="text-lg text-muted-foreground">
            {t.events.subtitle}
          </p>
        </div>

        {/* Events Grid */}
        {events.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Ticket className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No events available</h3>
              <p className="text-muted-foreground">
                Check back later for upcoming events
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => {
              const soldOut = event.availableTickets === 0;
              const almostSoldOut =
                event.availableTickets < event.totalTickets * 0.1 && !soldOut;

              return (
                <Card key={event.id} className="overflow-hidden flex flex-col">
                  {/* Event Image */}
                  <div className="relative h-48 bg-slate-200">
                    {event.imageUrl && (
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  {soldOut && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <Badge variant="secondary" className="text-lg px-4 py-2">
                        {t.events.soldOut}
                      </Badge>
                    </div>
                  )}
                    {almostSoldOut && !soldOut && (
                      <Badge className="absolute top-3 right-3 bg-red-600">
                        {t.events.almostSoldOut}
                      </Badge>
                    )}
                  </div>

                  <CardContent className="flex-1 pt-6">
                    <h3 className="font-bold text-xl mb-3 line-clamp-2">
                      {event.title}
                    </h3>

                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {format(new Date(event.date), 'MMM dd, yyyy • h:mm a')}
                        </span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{event.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>
                          {event.availableTickets} / {event.totalTickets} {t.events.available}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold">
                          ₩{event.price.toLocaleString()}
                        </span>
                        <span className="text-sm text-muted-foreground">{t.events.perTicket}</span>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter>
                    <Link href={`/events/${event.id}`} className="w-full">
                      <Button className="w-full gap-2" disabled={soldOut}>
                        <Ticket className="h-4 w-4" />
                        {soldOut ? t.events.soldOut : t.events.viewDetails}
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
