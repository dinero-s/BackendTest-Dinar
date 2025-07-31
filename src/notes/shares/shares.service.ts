import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Note } from '../entities/note.entity';
import { NoteShareLinkDto } from './dto/note-share-link.dto';
import { NoteShareLink } from './entities/note-share.entity';
import { v4 as uuidv4 } from 'uuid';
import { NotePublicDto } from './dto/note-public.dto';

@Injectable()
export class SharesService {
  constructor(
    @InjectRepository(Note) private readonly noteRepository: Repository<Note>,
    @InjectRepository(NoteShareLink)
    private readonly noteShareRepository: Repository<NoteShareLink>,
  ) {}
  async createShareLink(
    noteId: string,
    ttl: number,
  ): Promise<NoteShareLinkDto> {
    try {
      const note = await this.noteRepository.findOne({
        where: { id: noteId },
      });
      if (!note) throw new NotFoundException('Note not found');

      const token = uuidv4();
      const expiresAt = new Date(Date.now() + ttl * 60 * 1000);

      const share = this.noteShareRepository.create({
        token,
        expiresAt,
        used: false,
        noteId,
      });

      const saved: NoteShareLink = await this.noteShareRepository.save(share);

      return {
        id: saved.id,
        token: saved.token,
        expiresAt: saved.expiresAt,
        used: saved.used,
        createdAt: saved.createdAt,
        link: `http://localhost:3000/public/notes/${saved.token}`,
      };
    } catch (err: unknown) {
      throw new InternalServerErrorException('Ошибка при создании ссылки');
    }
  }

  async readPublicNote(token: string): Promise<NotePublicDto> {
    const link = await this.noteShareRepository.findOne({
      where: { token },
      relations: ['note'], // обязательно
    });

    if (!link || link.used || new Date() > link.expiresAt) {
      throw new NotFoundException('Ссылка недействительна или устарела');
    }

    // пометить ссылку как использованную (одноразовая)
    link.used = true;
    await this.noteShareRepository.save(link);

    const note = link.note;

    return {
      id: note.id,
      title: note.title,
      content: note.body,
      createdAt: note.createdAt,
    };
  }

  async getNoteShareLinks(noteId: string): Promise<NoteShareLinkDto[]> {
    const links = await this.noteShareRepository.find({
      where: { noteId },
      order: { createdAt: 'DESC' },
    });

    return links.map((link) => ({
      id: link.id,
      token: link.token,
      expiresAt: link.expiresAt,
      used: link.used,
      createdAt: link.createdAt,
      link: `https://your-domain.com/public/notes/${link.token}`,
    }));
  }

  async revokeNoteShareLink(noteId: string, tokenId: string): Promise<void> {
    const link = await this.noteShareRepository.findOne({
      where: { id: tokenId, note: { id: noteId } },
    });

    if (!link) {
      throw new NotFoundException('Ссылка не найдена');
    }

    await this.noteShareRepository.remove(link);
  }
}
