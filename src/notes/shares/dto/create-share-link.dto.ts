import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateShareLinkDto {
  @ApiProperty({ example: 10, description: 'Срок действия ссылки в минутах' })
  @IsInt()
  @Min(1)
  ttl: number;
}
