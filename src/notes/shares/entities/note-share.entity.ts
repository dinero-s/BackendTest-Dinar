import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Note } from '../../entities/note.entity';

@Entity('note_share_links')
export class NoteShareLink {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  expiresAt: Date;

  @Column({ default: false })
  used: boolean;

  @ManyToOne(() => Note, (note) => note.shareLinks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'noteId' })
  note: Note;

  @Column()
  noteId: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  tokenId: string;
}
