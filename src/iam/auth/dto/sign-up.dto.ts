import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, Length, IsBoolean, IsNotEmpty } from 'class-validator';

export class SignUpDto {
  @ApiProperty({
    title: 'Email',
    example: 'email@email.com',
    description: 'User email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    title: 'Password',
    example: 'P@ssw0rd',
    description:
      'Пароль должен быть не менее 8 символов и содержать как минимум одну цифру, один спец.символ, одну строчную и одну прописную латинские буквы',
  })
  @Length(8, 127)
  password: string;
}
