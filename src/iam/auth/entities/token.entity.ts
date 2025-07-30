import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Token {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @ApiProperty({ description: 'ID Пользователя' })
  userId: number;

  @Column({ unique: true })
  @ApiProperty({ description: 'Уникальный идентификатор токена' })
  tokenId: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  expiresAt?: Date;
}