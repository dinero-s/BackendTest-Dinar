import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({
    example: 'OldP@ssw0rd',
    description: 'Текущий пароль пользователя',
  })
  @IsString()
  currentPassword: string;

  @ApiProperty({
    example: 'NewP@ssw0rd1',
    description:
      'Новый пароль (не менее 8 символов, хотя бы 1 заглавная, 1 строчная буква, цифра и спецсимвол)',
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: 'Пароль должен быть не менее 8 символов' })
  newPassword: string;

  @ApiProperty({
    example: 'NewP@ssw0rd1',
    description: 'Подтверждение нового пароля',
  })
  @IsString()
  newPasswordConfirm: string;
}
