import {
    BadRequestException,
    ConflictException,
    Injectable,
    InternalServerErrorException,
    UnauthorizedException
} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {Note} from "./entities/note.entity";
import {CreateNoteDto} from "./dto/create-note.dto";
import {User} from "../users/entities/user.entity";

import * as process from "node:process";

@Injectable()
export class NotesService {
    constructor(
        @InjectRepository(Note) private readonly noteRepository: Repository<Note>,
        @InjectRepository(User) private readonly userRepository: Repository<User>) {}
    async create(
        createNoteDto: CreateNoteDto, id: string) {
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
                throw new ConflictException('Заметка с таким заголовком уже существует');
            }
            if (error.code === '23503') { // Ошибка внешнего ключа
                throw new BadRequestException('Некорректный ID пользователя');
            }
            throw new InternalServerErrorException('Ошибка при создании заметки');
        }
    }
}
