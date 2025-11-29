import { Module, forwardRef } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { WaitlistModule } from '../waitlist/waitlist.module';

@Module({
  imports: [
    BlockchainModule,
    forwardRef(() => WaitlistModule),
  ],
  controllers: [TicketsController],
  providers: [TicketsService],
  exports: [TicketsService],
})
export class TicketsModule {}
