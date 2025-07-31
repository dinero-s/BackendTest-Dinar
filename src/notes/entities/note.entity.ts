import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { NoteShareLink } from '../shares/entities/note-share.entity';

@Entity()
export class Note {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @ManyToOne(() => User, (user) => user.notes)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => NoteShareLink, (link) => link.note)
  shareLinks: NoteShareLink[];

  @ApiProperty({
    example: 'Моя первая заметка',
    description: 'Заголовок заметки',
  })
  @Column()
  title: string;

  @ApiProperty({
    example: 'Это содержимое моей заметки...',
    description: 'Текст заметки',
  })
  @Column('text')
  body: string;

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: 'Дата создания',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    example: '2023-01-02T00:00:00.000Z',
    description: 'Дата последнего обновления',
  })
  @UpdateDateColumn()
  updatedAt: Date;
}
