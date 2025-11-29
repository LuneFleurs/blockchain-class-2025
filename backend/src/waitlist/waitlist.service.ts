import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TicketsService } from '../tickets/tickets.service';

@Injectable()
export class WaitlistService {
  constructor(
    private prisma: PrismaService,
    private ticketsService: TicketsService,
  ) {}

  /**
   * 대기열에 등록
   */
  async join(userId: string, eventId: string) {
    // 이벤트 존재 확인
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        tickets: true,
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // 이미 티켓을 소유하고 있는지 확인
    const existingTicket = await this.prisma.ticket.findFirst({
      where: {
        eventId,
        ownerId: userId,
        status: 'OWNED',
      },
    });

    if (existingTicket) {
      throw new BadRequestException('You already own a ticket for this event');
    }

    // 이미 대기열에 있는지 확인
    const existingWaitlist = await this.prisma.waitlist.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId,
        },
      },
    });

    if (existingWaitlist && existingWaitlist.status === 'WAITING') {
      throw new BadRequestException('Already in waitlist');
    }

    // 대기열에 추가
    const waitlist = await this.prisma.waitlist.upsert({
      where: {
        userId_eventId: {
          userId,
          eventId,
        },
      },
      update: {
        status: 'WAITING',
      },
      create: {
        userId,
        eventId,
        status: 'WAITING',
      },
      include: {
        event: {
          select: {
            title: true,
            date: true,
          },
        },
      },
    });

    // 현재 대기 순번 계산
    const position = await this.prisma.waitlist.count({
      where: {
        eventId,
        status: 'WAITING',
        createdAt: {
          lte: waitlist.createdAt,
        },
      },
    });

    return {
      ...waitlist,
      position,
    };
  }

  /**
   * 대기열에서 나가기
   */
  async leave(userId: string, eventId: string) {
    const waitlist = await this.prisma.waitlist.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId,
        },
      },
    });

    if (!waitlist) {
      throw new NotFoundException('Not in waitlist');
    }

    // 상태를 CANCELLED로 변경 (완전 삭제 대신)
    return this.prisma.waitlist.update({
      where: {
        userId_eventId: {
          userId,
          eventId,
        },
      },
      data: {
        status: 'CANCELLED',
      },
    });
  }

  /**
   * 내 대기열 상태 조회
   */
  async getMyStatus(userId: string, eventId: string) {
    const waitlist = await this.prisma.waitlist.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId,
        },
      },
      include: {
        event: {
          select: {
            title: true,
            date: true,
          },
        },
      },
    });

    if (!waitlist || waitlist.status !== 'WAITING') {
      return null;
    }

    // 현재 대기 순번 계산
    const position = await this.prisma.waitlist.count({
      where: {
        eventId,
        status: 'WAITING',
        createdAt: {
          lte: waitlist.createdAt,
        },
      },
    });

    return {
      ...waitlist,
      position,
    };
  }

  /**
   * 이벤트의 대기열 목록 조회
   */
  async getEventWaitlist(eventId: string) {
    const waitlists = await this.prisma.waitlist.findMany({
      where: {
        eventId,
        status: 'WAITING',
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return waitlists;
  }

  /**
   * 랜덤 대기자 선택 및 티켓 자동 구매
   * (환불 시 호출됨)
   */
  async processLottery(eventId: string): Promise<boolean> {
    // 대기 중인 사용자 목록 조회
    const waitingUsers = await this.prisma.waitlist.findMany({
      where: {
        eventId,
        status: 'WAITING',
      },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: 'asc', // 먼저 신청한 순서대로
      },
    });

    if (waitingUsers.length === 0) {
      return false; // 대기자 없음
    }

    // 첫 번째 대기자 선택 (FIFO - First In First Out)
    const selectedWaitlist = waitingUsers[0];

    try {
      // 티켓 자동 구매
      await this.ticketsService.buyTicket(selectedWaitlist.userId, { eventId });

      // 대기열 상태 업데이트
      await this.prisma.waitlist.update({
        where: {
          id: selectedWaitlist.id,
        },
        data: {
          status: 'FULFILLED',
        },
      });

      console.log(`🎉 Lottery success! Ticket assigned to ${selectedWaitlist.user.email}`);
      return true;
    } catch (error) {
      console.error('Lottery failed:', error);
      return false;
    }
  }
}
