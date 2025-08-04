import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, MinLength } from 'class-validator';

export class SignInDto {
  @ApiProperty({
    title: 'Email',
    example: 'demo@gmail.com',
    description: 'email пользователя',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    title: 'Пароль',
    example: 'Password123',
    description: 'Минимальная длина 8 символов',
  })
  @MinLength(8)
  password: string;
}
