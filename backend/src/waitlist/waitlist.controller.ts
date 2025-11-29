import { Controller, Post, Delete, Get, Param, UseGuards, Request } from '@nestjs/common';
import { WaitlistService } from './waitlist.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('waitlist')
export class WaitlistController {
  constructor(private readonly waitlistService: WaitlistService) {}

  /**
   * 대기열에 등록
   */
  @Post(':eventId')
  @UseGuards(JwtAuthGuard)
  async join(@Param('eventId') eventId: string, @Request() req) {
    return this.waitlistService.join(req.user.sub, eventId);
  }

  /**
   * 대기열에서 나가기
   */
  @Delete(':eventId')
  @UseGuards(JwtAuthGuard)
  async leave(@Param('eventId') eventId: string, @Request() req) {
    return this.waitlistService.leave(req.user.sub, eventId);
  }

  /**
   * 내 대기열 상태 조회
   */
  @Get(':eventId/status')
  @UseGuards(JwtAuthGuard)
  async getMyStatus(@Param('eventId') eventId: string, @Request() req) {
    return this.waitlistService.getMyStatus(req.user.sub, eventId);
  }

  /**
   * 이벤트의 대기열 목록 조회 (관리자용)
   */
  @Get(':eventId')
  @UseGuards(JwtAuthGuard)
  async getEventWaitlist(@Param('eventId') eventId: string) {
    return this.waitlistService.getEventWaitlist(eventId);
  }
}
