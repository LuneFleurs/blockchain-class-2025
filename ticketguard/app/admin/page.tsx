'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Calendar, MapPin, Ticket, Loader2, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useAuthStore, useLanguageStore } from '@/lib/store';
import { eventsAPI } from '@/lib/api';
import { Event } from '@/lib/types';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function AdminPage() {
  const router = useRouter();
  const { language } = useLanguageStore();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Zustand persist hydration 처리
  const authStore = useAuthStore();
  const isHydrated = authStore._hasHydrated;
  const isAuthenticated = authStore.isAuthenticated;
  const user = authStore.user;

  // 폼 데이터
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    price: '',
    location: '',
    description: '',
    imageUrl: '',
    totalTickets: '',
    contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '',
  });

  useEffect(() => {
    console.log('[Admin Page] useEffect triggered:', {
      isHydrated,
      isAuthenticated,
      user,
      authStore: {
        _hasHydrated: authStore._hasHydrated,
        isAuthenticated: authStore.isAuthenticated,
        user: authStore.user,
      }
    });

    // Zustand persist hydration이 완료될 때까지 대기
    if (!isHydrated) {
      console.log('[Admin Page] Waiting for hydration...');
      return;
    }

    // 인증되지 않은 경우 로그인 페이지로 리다이렉션
    if (!isAuthenticated) {
      console.log('[Admin Page] Not authenticated, redirecting to login');
      router.push('/login');
      return;
    }

    // 인증된 경우 공연 목록 가져오기
    console.log('[Admin Page] Authenticated, fetching events');
    fetchEvents();
  }, [isHydrated, isAuthenticated]);

  const fetchEvents = async () => {
    try {
      const data = await eventsAPI.getAll();
      setEvents(data);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      // 날짜와 시간 합치기
      const dateTime = `${formData.date}T${formData.time}:00`;

      await eventsAPI.create({
        title: formData.title,
        date: dateTime,
        price: parseInt(formData.price),
        location: formData.location,
        description: formData.description,
        imageUrl: formData.imageUrl,
        totalTickets: parseInt(formData.totalTickets) || 100,
        contractAddress: formData.contractAddress,
      });

      toast.success(
        language === 'ko' ? '✅ 공연 등록 완료' : '✅ Event Created',
        {
          description: language === 'ko'
            ? '새로운 공연이 성공적으로 등록되었습니다.'
            : 'New event has been successfully created.',
        }
      );

      // 폼 초기화
      setFormData({
        title: '',
        date: '',
        time: '',
        price: '',
        location: '',
        description: '',
        imageUrl: '',
        totalTickets: '',
        contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '',
      });

      setShowCreateDialog(false);
      fetchEvents();
    } catch (error) {
      console.error('Failed to create event:', error);
      toast.error(
        language === 'ko' ? '❌ 공연 등록 실패' : '❌ Failed to Create',
        {
          description: language === 'ko'
            ? '공연 등록 중 오류가 발생했습니다.'
            : 'An error occurred while creating the event.',
        }
      );
    } finally {
      setCreating(false);
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);

    // 날짜와 시간 분리
    const eventDate = new Date(event.date);
    const dateStr = eventDate.toISOString().split('T')[0];
    const timeStr = eventDate.toTimeString().slice(0, 5);

    setFormData({
      title: event.title,
      date: dateStr,
      time: timeStr,
      price: event.price.toString(),
      location: event.location || '',
      description: event.description || '',
      imageUrl: event.imageUrl || '',
      totalTickets: event.totalTickets.toString(),
      contractAddress: event.contractAddress,
    });

    setShowEditDialog(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;

    setUpdating(true);

    try {
      // 날짜와 시간 합치기
      const dateTime = `${formData.date}T${formData.time}:00`;

      await eventsAPI.update(editingEvent.id, {
        title: formData.title,
        date: dateTime,
        price: parseInt(formData.price),
        location: formData.location,
        description: formData.description,
        imageUrl: formData.imageUrl,
        totalTickets: parseInt(formData.totalTickets),
      });

      toast.success(
        language === 'ko' ? '✅ 공연 수정 완료' : '✅ Event Updated',
        {
          description: language === 'ko'
            ? '공연 정보가 성공적으로 수정되었습니다.'
            : 'Event has been successfully updated.',
        }
      );

      setShowEditDialog(false);
      setEditingEvent(null);
      fetchEvents();
    } catch (error) {
      console.error('Failed to update event:', error);
      toast.error(
        language === 'ko' ? '❌ 공연 수정 실패' : '❌ Failed to Update',
        {
          description: language === 'ko'
            ? '공연 수정 중 오류가 발생했습니다.'
            : 'An error occurred while updating the event.',
        }
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(language === 'ko'
      ? `"${title}" 공연을 정말 삭제하시겠습니까?`
      : `Are you sure you want to delete "${title}"?`
    )) {
      return;
    }

    setDeleting(id);

    try {
      await eventsAPI.delete(id);

      toast.success(
        language === 'ko' ? '✅ 공연 삭제 완료' : '✅ Event Deleted',
        {
          description: language === 'ko'
            ? '공연이 성공적으로 삭제되었습니다.'
            : 'Event has been successfully deleted.',
        }
      );

      fetchEvents();
    } catch (error: any) {
      // 백엔드 에러 메시지 추출
      const errorMessage = error?.response?.data?.message || error?.message || 'Unknown error';

      // 400 에러 (예상된 에러)는 경고로, 그 외는 에러로 로깅
      if (error?.response?.status === 400) {
        console.warn('⚠️ Expected error - Cannot delete event:', errorMessage);
      } else {
        console.error('❌ Unexpected error - Failed to delete event:', error);
      }

      toast.error(
        language === 'ko' ? '❌ 공연 삭제 불가' : '❌ Cannot Delete Event',
        {
          description: errorMessage.includes('ticket record')
            ? (language === 'ko'
              ? '티켓 기록이 있는 공연은 삭제할 수 없습니다. 관리자에게 문의하세요.'
              : errorMessage)
            : errorMessage.includes('active ticket')
            ? (language === 'ko'
              ? '발급된 티켓이 있는 공연은 삭제할 수 없습니다.'
              : 'Cannot delete event with active tickets.')
            : errorMessage.includes('waitlist')
            ? (language === 'ko'
              ? '대기열이 있는 공연은 삭제할 수 없습니다.'
              : 'Cannot delete event with waitlist entries.')
            : errorMessage.includes('Foreign key constraint')
            ? (language === 'ko'
              ? '티켓이나 대기열이 있어 삭제할 수 없습니다. 먼저 관련 데이터를 삭제하세요.'
              : 'Cannot delete event due to existing tickets or waitlist. Please remove related data first.')
            : (language === 'ko'
              ? '공연 삭제 중 오류가 발생했습니다.'
              : 'An error occurred while deleting the event.'),
        }
      );
    } finally {
      setDeleting(null);
    }
  };

  if (!isHydrated || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              {language === 'ko' ? '관리자 대시보드' : 'Admin Dashboard'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'ko' ? '공연을 관리하고 통계를 확인하세요' : 'Manage events and view statistics'}
            </p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            {language === 'ko' ? '공연 등록' : 'Create Event'}
          </Button>
        </div>

        {/* 통계 카드 */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {language === 'ko' ? '전체 공연' : 'Total Events'}
              </CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{events.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {language === 'ko' ? '판매된 티켓' : 'Tickets Sold'}
              </CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {events.reduce((sum, e) => sum + (e.totalTickets - e.availableTickets), 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {language === 'ko' ? '남은 티켓' : 'Available Tickets'}
              </CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {events.reduce((sum, e) => sum + e.availableTickets, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 공연 목록 */}
        <Card>
          <CardHeader>
            <CardTitle>{language === 'ko' ? '공연 목록' : 'Event List'}</CardTitle>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <div className="text-center py-12">
                <Ticket className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {language === 'ko' ? '등록된 공연이 없습니다' : 'No events yet'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      {event.imageUrl && (
                        <img
                          src={event.imageUrl}
                          alt={event.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{event.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(event.date), 'yyyy-MM-dd HH:mm')}
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {event.location}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">
                          {language === 'ko' ? '판매/전체' : 'Sold/Total'}
                        </div>
                        <div className="font-bold">
                          {event.totalTickets - event.availableTickets} / {event.totalTickets}
                        </div>
                      </div>
                      <Badge variant={event.availableTickets === 0 ? 'secondary' : 'default'}>
                        {event.availableTickets === 0
                          ? language === 'ko' ? '매진' : 'Sold Out'
                          : `${event.availableTickets} ${language === 'ko' ? '남음' : 'left'}`}
                      </Badge>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(event)}
                          disabled={deleting === event.id}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(event.id, event.title)}
                          disabled={deleting === event.id}
                        >
                          {deleting === event.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 공연 등록 다이얼로그 */}
        <Dialog open={showCreateDialog} onOpenChange={(open) => {
          setShowCreateDialog(open);
          if (!open) {
            // 다이얼로그 닫을 때 폼 초기화
            setFormData({
              title: '',
              date: '',
              time: '',
              price: '',
              location: '',
              description: '',
              imageUrl: '',
              totalTickets: '',
              contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '',
            });
          }
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{language === 'ko' ? '새 공연 등록' : 'Create New Event'}</DialogTitle>
              <DialogDescription>
                {language === 'ko'
                  ? '공연 정보를 입력하여 새로운 이벤트를 생성하세요'
                  : 'Fill in the event details to create a new event'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">{language === 'ko' ? '공연 제목' : 'Event Title'}</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder={language === 'ko' ? '예: BTS 월드 투어' : 'e.g., BTS World Tour'}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">{language === 'ko' ? '날짜' : 'Date'}</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="time">{language === 'ko' ? '시간' : 'Time'}</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location">{language === 'ko' ? '장소' : 'Location'}</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder={language === 'ko' ? '예: 잠실 종합운동장' : 'e.g., Olympic Stadium'}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">{language === 'ko' ? '가격 (₩)' : 'Price (₩)'}</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    placeholder="150000"
                  />
                </div>
                <div>
                  <Label htmlFor="totalTickets">{language === 'ko' ? '총 티켓 수' : 'Total Tickets'}</Label>
                  <Input
                    id="totalTickets"
                    type="number"
                    value={formData.totalTickets}
                    onChange={(e) => setFormData({ ...formData, totalTickets: e.target.value })}
                    placeholder="100"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="imageUrl">{language === 'ko' ? '이미지 URL' : 'Image URL'}</Label>
                <Input
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div>
                <Label htmlFor="description">{language === 'ko' ? '설명' : 'Description'}</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full min-h-[100px] px-3 py-2 border border-input bg-background rounded-md"
                  placeholder={language === 'ko' ? '공연에 대한 설명을 입력하세요' : 'Enter event description'}
                />
              </div>

              {/* Contract Address는 자동으로 설정됩니다 (환경 변수 사용) */}

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                  className="flex-1"
                  disabled={creating}
                >
                  {language === 'ko' ? '취소' : 'Cancel'}
                </Button>
                <Button type="submit" className="flex-1" disabled={creating}>
                  {creating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      {language === 'ko' ? '등록 중...' : 'Creating...'}
                    </>
                  ) : (
                    language === 'ko' ? '등록' : 'Create'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* 공연 수정 다이얼로그 */}
        <Dialog open={showEditDialog} onOpenChange={(open) => {
          setShowEditDialog(open);
          if (!open) {
            setEditingEvent(null);
          }
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{language === 'ko' ? '공연 정보 수정' : 'Edit Event'}</DialogTitle>
              <DialogDescription>
                {language === 'ko'
                  ? '공연 정보를 수정하세요'
                  : 'Update the event details'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <Label htmlFor="edit-title">{language === 'ko' ? '공연 제목' : 'Event Title'}</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder={language === 'ko' ? '예: BTS 월드 투어' : 'e.g., BTS World Tour'}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-date">{language === 'ko' ? '날짜' : 'Date'}</Label>
                  <Input
                    id="edit-date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-time">{language === 'ko' ? '시간' : 'Time'}</Label>
                  <Input
                    id="edit-time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-location">{language === 'ko' ? '장소' : 'Location'}</Label>
                <Input
                  id="edit-location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder={language === 'ko' ? '예: 잠실 종합운동장' : 'e.g., Olympic Stadium'}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-price">{language === 'ko' ? '가격 (₩)' : 'Price (₩)'}</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    placeholder="150000"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-totalTickets">{language === 'ko' ? '총 티켓 수' : 'Total Tickets'}</Label>
                  <Input
                    id="edit-totalTickets"
                    type="number"
                    value={formData.totalTickets}
                    onChange={(e) => setFormData({ ...formData, totalTickets: e.target.value })}
                    placeholder="100"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-imageUrl">{language === 'ko' ? '이미지 URL' : 'Image URL'}</Label>
                <Input
                  id="edit-imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div>
                <Label htmlFor="edit-description">{language === 'ko' ? '설명' : 'Description'}</Label>
                <textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full min-h-[100px] px-3 py-2 border border-input bg-background rounded-md"
                  placeholder={language === 'ko' ? '공연에 대한 설명을 입력하세요' : 'Enter event description'}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditDialog(false)}
                  className="flex-1"
                  disabled={updating}
                >
                  {language === 'ko' ? '취소' : 'Cancel'}
                </Button>
                <Button type="submit" className="flex-1" disabled={updating}>
                  {updating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      {language === 'ko' ? '수정 중...' : 'Updating...'}
                    </>
                  ) : (
                    language === 'ko' ? '수정' : 'Update'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
