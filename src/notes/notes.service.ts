import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Note } from './entities/note.entity';
import { CreateNoteDto } from './dto/create-note.dto';
import { NoteShareLink } from './shares/entities/note-share.entity';

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Note) private readonly noteRepository: Repository<Note>,
    @InjectRepository(NoteShareLink)
    private readonly noteShareRepository: Repository<NoteShareLink>,
  ) {}
  async create(createNoteDto: CreateNoteDto, id: string) {
    console.log(id);
    try {
      const note = this.noteRepository.create({
        title: createNoteDto.title,
        body: createNoteDto.body,
        userId: id,
      });

      await this.noteRepository.save(note);

      return note;
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException(
          'Заметка с таким заголовком уже существует',
          {
            cause: error,
          },
        );
      }
      if (error.code === '23503') {
        throw new BadRequestException('Некорректный ID пользователя', {
          cause: error,
        });
      }
      throw new InternalServerErrorException('Ошибка при создании заметки', {
        cause: error,
      });
    }
  }
}
