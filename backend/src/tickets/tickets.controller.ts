import { Controller, Get, Post, Body, Param, UseGuards, Request, Inject, forwardRef } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { BuyTicketDto } from './dto/buy-ticket.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WaitlistService } from '../waitlist/waitlist.service';

@Controller('tickets')
export class TicketsController {
  constructor(
    private readonly ticketsService: TicketsService,
    @Inject(forwardRef(() => WaitlistService))
    private readonly waitlistService: WaitlistService,
  ) {}

  @Post('buy')
  @UseGuards(JwtAuthGuard)
  buyTicket(@Request() req, @Body() buyTicketDto: BuyTicketDto) {
    return this.ticketsService.buyTicket(req.user.sub, buyTicketDto);
  }

  @Post(':id/refund')
  @UseGuards(JwtAuthGuard)
  async refundTicket(@Request() req, @Param('id') id: string) {
    // 환불 처리
    const result = await this.ticketsService.refundTicket(req.user.sub, id);

    // 환불 성공 시 대기열 재추첨 실행
    if (result.eventId) {
      try {
        const lotterySuccess = await this.waitlistService.processLottery(result.eventId);
        if (lotterySuccess) {
          console.log(`🎉 Re-lottery successful for event ${result.eventId}`);
        }
      } catch (error) {
        console.error('Re-lottery failed:', error);
        // 재추첨 실패해도 환불은 성공이므로 에러를 던지지 않음
      }
    }

    return result;
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  findUserTickets(@Request() req) {
    return this.ticketsService.findUserTickets(req.user.sub);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.ticketsService.findOne(id);
  }

  @Get('blockchain/:tokenId')
  @UseGuards(JwtAuthGuard)
  getTicketInfoFromBlockchain(@Param('tokenId') tokenId: string) {
    return this.ticketsService.getTicketInfoFromBlockchain(Number(tokenId));
  }
}
