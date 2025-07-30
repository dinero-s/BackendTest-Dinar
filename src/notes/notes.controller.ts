import {
  Controller,
  Post,
  Body,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from '../iam/auth/guards/jwt-auth.guard';
import { string } from 'joi';
import { CurrentUser } from '../iam/auth/decorators/current-user.decorator';

@Controller('notes')
@ApiBearerAuth()
@ApiTags('Notes')
export class NotesController {
  constructor(
    private readonly notesService: NotesService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('create')
  @ApiOperation({ summary: 'Создание новой заметки' })
  @ApiResponse({ status: 201, description: 'Заметка успешно создана' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiBody({ type: CreateNoteDto })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() createNoteDto: CreateNoteDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.notesService.create(createNoteDto, user.userId);
  }
}
