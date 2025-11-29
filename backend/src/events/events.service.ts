import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  /**
   * 공연 등록
   */
  async create(createEventDto: CreateEventDto) {
    const event = await this.prisma.event.create({
      data: {
        title: createEventDto.title,
        date: new Date(createEventDto.date),
        price: createEventDto.price,
        location: createEventDto.location,
        description: createEventDto.description,
        imageUrl: createEventDto.imageUrl,
        totalTickets: createEventDto.totalTickets || 100,
        contractAddress: createEventDto.contractAddress,
      },
    });

    return {
      ...event,
      availableTickets: event.totalTickets,
    };
  }

  /**
   * 모든 공연 조회
   */
  async findAll() {
    const events = await this.prisma.event.findMany({
      orderBy: {
        date: 'asc',
      },
      include: {
        _count: {
          select: { tickets: true },
        },
        tickets: {
          where: {
            status: 'OWNED',
          },
        },
      },
    });

    // availableTickets 계산해서 반환
    return events.map((event) => ({
      ...event,
      availableTickets: event.totalTickets - event.tickets.length,
      tickets: undefined, // tickets 배열은 제거
      _count: undefined, // _count도 제거
    }));
  }

  /**
   * 특정 공연 조회
   */
  async findOne(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        tickets: {
          where: {
            status: 'OWNED',
          },
          include: {
            owner: {
              select: {
                id: true,
                email: true,
                walletAddress: true,
              },
            },
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    // availableTickets 계산
    return {
      ...event,
      availableTickets: event.totalTickets - event.tickets.length,
    };
  }

  /**
   * 공연 정보 수정
   */
  async update(id: string, updateEventDto: UpdateEventDto) {
    const event = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    const updatedEvent = await this.prisma.event.update({
      where: { id },
      data: {
        ...(updateEventDto.title && { title: updateEventDto.title }),
        ...(updateEventDto.date && { date: new Date(updateEventDto.date) }),
        ...(updateEventDto.price !== undefined && { price: updateEventDto.price }),
        ...(updateEventDto.location !== undefined && { location: updateEventDto.location }),
        ...(updateEventDto.description !== undefined && { description: updateEventDto.description }),
        ...(updateEventDto.imageUrl !== undefined && { imageUrl: updateEventDto.imageUrl }),
        ...(updateEventDto.totalTickets !== undefined && { totalTickets: updateEventDto.totalTickets }),
      },
      include: {
        tickets: {
          where: {
            status: 'OWNED',
          },
        },
      },
    });

    return {
      ...updatedEvent,
      availableTickets: updatedEvent.totalTickets - updatedEvent.tickets.length,
      tickets: undefined,
    };
  }

  /**
   * 공연 삭제
   */
  async remove(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        tickets: true, // 모든 티켓 (OWNED, REFUNDED 포함)
        waitlists: true,
      },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    // OWNED 상태의 티켓이 있으면 삭제 불가
    const ownedTickets = event.tickets.filter(t => t.status === 'OWNED');
    if (ownedTickets.length > 0) {
      throw new BadRequestException(
        `Cannot delete event with ${ownedTickets.length} active ticket(s). ` +
        `Please refund all tickets first.`
      );
    }

    // REFUNDED 티켓이 있으면 경고 메시지와 함께 삭제 허용
    const refundedTickets = event.tickets.filter(t => t.status === 'REFUNDED');
    if (refundedTickets.length > 0) {
      console.log(
        `⚠️ Deleting event with ${refundedTickets.length} refunded ticket record(s). ` +
        `These records will be cascade deleted.`
      );
    }

    // 대기열이 있으면 삭제 불가 (선택적)
    if (event.waitlists.length > 0) {
      throw new BadRequestException(
        `Cannot delete event with ${event.waitlists.length} waitlist entry/entries. Please clear waitlist first.`
      );
    }

    await this.prisma.event.delete({
      where: { id },
    });

    return { message: 'Event deleted successfully' };
  }
}
