import {
    Controller,
    Post,
    Body,
    Request, UnauthorizedException, UseGuards
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import {
    ApiBearerAuth,
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBody } from '@nestjs/swagger';
import {JwtService} from "@nestjs/jwt";
import {JwtAuthGuard} from "../iam/auth/guards"


@Controller('notes')
@ApiBearerAuth()
@ApiTags('Notes')
export class NotesController {
    constructor(
        private readonly notesService: NotesService,
        private readonly jwtService: JwtService,) {}

    @Post('create')
    @ApiOperation({ summary: 'Создание новой заметки' })
    @ApiResponse({ status: 201, description: 'Заметка успешно создана' })
    @ApiResponse({ status: 401, description: 'Не авторизован' })
    @ApiBody({ type: CreateNoteDto })
    @ApiBearerAuth()

    create(
        @Body() createNoteDto: CreateNoteDto,
        @Request() req: Request) {
        // Извлекаем токен из заголовка
        const authHeader = req.headers['authorization'];
        const token = authHeader?.split(' ')[1];

        if (!token) {
            throw new UnauthorizedException('Токен не предоставлен');
        }

        // Декодируем токен
        const decoded = this.jwtService.decode(token);
        if (!decoded?.id) {
            throw new UnauthorizedException('Неверный токен');
        }

        // Передаем данные в сервис
        return this.notesService.create(createNoteDto, decoded.id);
    }

}
