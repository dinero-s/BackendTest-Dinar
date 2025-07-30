import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateNoteDto {
   @ApiProperty({ example: 'Моя заметка', description: 'Заголовок заметки' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Содержимое заметки', description: 'Текст заметки' })
  @IsString()
  body: string;
}