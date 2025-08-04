import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, Length } from 'class-validator';

export class SignUpDto {
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
    description: 'Пароль должен быть не менее 8 символов',
  })
  @Length(8, 127)
  password: string;
}
