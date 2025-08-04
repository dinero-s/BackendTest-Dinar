import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  GoneException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Note } from '../entities/note.entity';
import { NoteShareLinkDto } from './dto/note-share-link.dto';
import { NoteShareLink } from './entities/note-share.entity';
import { JwtService } from '@nestjs/jwt';
import { NotePublicDto } from './dto/note-public.dto';
import { ConfigService } from '@nestjs/config';
import * as process from 'node:process';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SharesService {
  constructor(
    @InjectRepository(Note) private readonly noteRepository: Repository<Note>,
    @InjectRepository(NoteShareLink)
    private readonly noteShareRepository: Repository<NoteShareLink>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
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

      const expiresAt = new Date(Date.now() + ttl * 60 * 1000);
      const tokenId = uuidv4();

      const share = this.noteShareRepository.create({
        noteId,
        used: false,
        expiresAt,
        tokenId,
      });

      const saved: NoteShareLink = await this.noteShareRepository.save(share);

      const token = this.jwtService.sign(
        {
          shareId: saved.id,
          type: 'note_share',
        },
        {
          secret: this.config.get<string>('JWT_SHARE_SECRET'),
          expiresIn: process.env.JWT_SHARE_TTL,
        },
      );

      return {
        id: saved.id,
        tokenId,
        token,
        expiresAt: saved.expiresAt,
        used: saved.used,
        createdAt: saved.createdAt,
        link: `http://localhost:3000/public/notes/${token}`,
      };
    } catch (error) {
      throw new InternalServerErrorException('Ошибка при создании ссылки', {
        cause: error,
      });
    }
  }

  async readPublicNote(token: string): Promise<NotePublicDto> {
    let payload: { shareId: string };

    try {
      payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SHARE_SECRET,
      });
    } catch (error) {
      throw new GoneException('Ссылка устарела или повреждена', {
        cause: error,
      });
    }

    const link = await this.noteShareRepository.findOne({
      where: { id: payload.shareId },
      relations: ['note'],
    });

    if (!link) {
      throw new NotFoundException('Ссылка не найдена');
    }

    if (link.used || new Date() > link.expiresAt) {
      throw new GoneException('Ссылка уже использована или истекла');
    }

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

  async getNoteShareLinks(userId: string): Promise<NoteShareLinkDto[]> {
    try {
      const links = await this.noteShareRepository.find({
        relations: ['note'],
        where: {
          note: { userId },
        },
        order: { createdAt: 'DESC' },
      });

      return links.map((link) => {
        const expiresInSec = Math.floor(
          (link.expiresAt.getTime() - Date.now()) / 1000,
        );

        const token = this.jwtService.sign(
          {
            shareId: link.id,
            tokenId: link.tokenId,
            type: 'note_share',
          },
          {
            secret: process.env.JWT_SHARE_SECRET,
            expiresIn: `${expiresInSec}s`,
          },
        );

        return {
          id: link.id,
          tokenId: link.tokenId,
          expiresAt: link.expiresAt,
          used: link.used,
          createdAt: link.createdAt,
          token,
          link: `http://localhost:3000/public/notes/${token}`,
        };
      });
    } catch (error) {
      throw new GoneException('Ссылки не найдены или повреждены', {
        cause: error,
      });
    }
  }

  async revokeNoteShareLink(noteId: string, shareId: string): Promise<void> {
    try {
      const link = await this.noteShareRepository.findOne({
        where: {
          id: shareId,
          note: { id: noteId },
        },
        relations: ['note'],
      });

      if (!link) {
        throw new NotFoundException('Ссылка не найдена');
      }

      await this.noteShareRepository.remove(link);
    } catch (error) {
      throw new GoneException('Не удалось отозвать ссылку', {
        cause: error,
      });
    }
  }
}
