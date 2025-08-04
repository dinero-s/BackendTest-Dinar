import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEmail, Length } from 'class-validator';
import { User } from '../entities/user.entity';

export class CreateUserDto extends PartialType(User) {
  @ApiProperty({
    example: 'demo@gmail.com',
    description: 'User email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Password123',
    description: 'Будет сохранен как passwordHash в базе данных',
  })
  @Length(8, 250)
  password: string;
}
