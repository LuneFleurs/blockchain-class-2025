import { IsString, IsNotEmpty } from 'class-validator';

export class BuyTicketDto {
  @IsString()
  @IsNotEmpty()
  eventId: string;
}
