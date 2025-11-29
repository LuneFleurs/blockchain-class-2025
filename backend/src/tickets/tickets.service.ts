import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { BuyTicketDto } from './dto/buy-ticket.dto';

@Injectable()
export class TicketsService {
  constructor(
    private prisma: PrismaService,
    private blockchainService: BlockchainService,
  ) {}

  /**
   * 티켓 구매
   * 1. 이벤트 조회
   * 2. NFT 발행
   * 3. DB에 티켓 정보 저장
   */
  async buyTicket(userId: string, buyTicketDto: BuyTicketDto) {
    const { eventId } = buyTicketDto;

    // 이벤트 조회
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    // 사용자 조회
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // NFT 티켓 발행 (블록체인)
    const { tokenId, txHash } = await this.blockchainService.mintTicket(
      user.walletAddress,
      event.title,
      Math.floor(event.date.getTime() / 1000), // Unix timestamp
      event.price,
    );

    // DB에 티켓 저장
    const ticket = await this.prisma.ticket.create({
      data: {
        tokenId,
        status: 'OWNED',
        ownerId: userId,
        eventId,
      },
      include: {
        event: true,
        owner: {
          select: {
            id: true,
            email: true,
            walletAddress: true,
          },
        },
      },
    });

    return {
      ticket,
      txHash,
    };
  }

  /**
   * 티켓 환불
   * 1. 티켓 조회 및 소유권 확인
   * 2. 블록체인에서 환불 처리 (플랫폼으로 전송)
   * 3. DB에서 티켓 상태 업데이트
   */
  async refundTicket(userId: string, ticketId: string) {
    // 티켓 조회
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        owner: true,
        event: true,
      },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${ticketId} not found`);
    }

    // 소유권 확인
    if (ticket.ownerId !== userId) {
      throw new BadRequestException('You are not the owner of this ticket');
    }

    // 이미 환불된 티켓인지 확인
    if (ticket.status === 'REFUNDED') {
      throw new BadRequestException('Ticket already refunded');
    }

    // 소유자 정보 확인
    if (!ticket.owner) {
      throw new BadRequestException('Ticket owner information not found');
    }

    // 블록체인에서 환불 처리
    const { txHash } = await this.blockchainService.refundTicket(
      ticket.owner.encryptedPrivateKey,
      ticket.tokenId,
    );

    // DB에서 티켓 상태 업데이트
    const updatedTicket = await this.prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status: 'REFUNDED',
        ownerId: null, // 소유권 해제
      },
      include: {
        event: true,
      },
    });

    return {
      ticket: updatedTicket,
      txHash,
      eventId: ticket.eventId, // 재추첨을 위한 이벤트 ID 반환
    };
  }

  /**
   * 사용자의 모든 티켓 조회
   */
  async findUserTickets(userId: string) {
    const tickets = await this.prisma.ticket.findMany({
      where: {
        ownerId: userId,
        status: 'OWNED',
      },
      include: {
        event: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return tickets;
  }

  /**
   * 특정 티켓 조회
   */
  async findOne(ticketId: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        event: true,
        owner: {
          select: {
            id: true,
            email: true,
            walletAddress: true,
          },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${ticketId} not found`);
    }

    return ticket;
  }

  /**
   * 블록체인에서 티켓 정보 조회
   */
  async getTicketInfoFromBlockchain(tokenId: number) {
    return this.blockchainService.getTicketInfo(tokenId);
  }
}
