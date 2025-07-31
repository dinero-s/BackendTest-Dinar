import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Token {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'ID записи токена' })
  id: string;

  @Column({ nullable: true })
  @ApiProperty({ description: 'ID Пользователя' })
  userId: string;

  @Column({ unique: true })
  @ApiProperty({
    description: 'Уникальный идентификатор токена (в JWT payload)',
  })
  tokenHash: string;

  @Column({ default: false })
  @ApiProperty({ description: 'Флаг: токен отозван (logout или вручную)' })
  revoked: boolean;

  @Column({ nullable: true })
  @ApiProperty({ description: 'Срок действия токена (если есть)' })
  expiresAt?: Date;

  @CreateDateColumn()
  @ApiProperty({ description: 'Дата создания токена' })
  createdAt: Date;
}
