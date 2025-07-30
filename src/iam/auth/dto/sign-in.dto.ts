import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  MinLength,
} from 'class-validator';

export class SignInDto {
  @ApiProperty({
    title: 'Email',
    example: 'email@email.com',
    description: 'email пользователя',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    title: 'Пароль',
    example: 'P@ssw0rd',
    description:
      'Минимальная длина 8 символов, должен содержать цифру, букву, спецсимвол',
  })
  @MinLength(8)
  password: string;
}
