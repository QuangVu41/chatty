import { IsOptional, IsString } from 'class-validator';

export class SendMessageDto {
  @IsString()
  @IsOptional()
  text?: string;
}
