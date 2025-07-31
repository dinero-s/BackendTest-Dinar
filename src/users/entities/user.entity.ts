import { IsEmail } from 'class-validator';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Note } from '../../notes/entities/note.entity';

@Entity()
export class User {
  @ApiProperty({
    example: 'a7f3c1b09dbe4fa8b2798d1c9c9eeb4d',
    description: 'ID Пользователя',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'somemail@somemail.com',
    description: 'Почта',
  })
  @Column({ unique: true })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '********',
    description: 'Пароль',
  })
  @Column({ select: false })
  passwordHash: string;

  @OneToMany(() => Note, (note) => note.user)
  notes: Note[];
}
