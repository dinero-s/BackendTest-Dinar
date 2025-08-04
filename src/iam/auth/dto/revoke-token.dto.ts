import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RevokeTokenDto {
  @ApiProperty({ example: 'JWT_REFRESH_TOKEN' })
  @IsString()
  refreshToken: string;
}
