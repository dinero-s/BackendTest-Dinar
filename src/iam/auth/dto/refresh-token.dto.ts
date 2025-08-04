import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({
    title: 'Refresh Token',
    example: 'Сюда вставить Refresh Token',
    description: 'Refresh-токен для обновления access-токена',
  })
  @IsNotEmpty()
  refreshToken: string;
}
