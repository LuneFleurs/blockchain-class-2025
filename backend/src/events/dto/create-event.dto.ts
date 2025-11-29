import { IsString, IsNotEmpty, IsInt, IsDateString, Min, IsOptional } from 'class-validator';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsInt()
  @Min(0)
  price: number;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  totalTickets?: number;

  @IsString()
  @IsNotEmpty()
  contractAddress: string;
}
