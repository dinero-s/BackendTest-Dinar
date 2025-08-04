import {
  Controller,
  Post,
  Body,
  UseGuards,
  Param,
  Get,
  ParseUUIDPipe,
  Delete,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../iam/auth/guards/jwt-auth.guard';
import { CurrentUser } from '../iam/auth/decorators/current-user.decorator';
import { CreateShareLinkDto } from './shares/dto/create-share-link.dto';
import { NoteShareLinkDto } from './shares/dto/note-share-link.dto';
import { NotePublicDto } from './shares/dto/note-public.dto';
import { SharesService } from './shares/shares.service';

@Controller('notes')
@ApiBearerAuth()
@ApiTags('Notes')
export class NotesController {
  constructor(
    private readonly notesService: NotesService,
    private readonly sharesService: SharesService,
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
    console.log(CreateNoteDto, user.userId);
    return this.notesService.create(createNoteDto, user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('/:id/share')
  @ApiOperation({ summary: 'Создать ссылку' })
  createShareLink(
    @Param('id') noteId: string,
    @Body() dto: CreateShareLinkDto,
  ): Promise<NoteShareLinkDto> {
    return this.sharesService.createShareLink(noteId, dto.ttl);
  }

  @Get('/public/notes/:token')
  @ApiOperation({ summary: 'Публичный доступ к заметке по одноразовой ссылке' })
  @ApiParam({ name: 'token', type: 'string' })
  @ApiResponse({ status: 200, type: NotePublicDto })
  readPublicNote(@Param('token') token: string): Promise<NotePublicDto> {
    return this.sharesService.readPublicNote(token);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:userId/share')
  @ApiOperation({ summary: 'Список ссылок владельцу' })
  getNoteShareLinks(
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<NoteShareLinkDto[]> {
    return this.sharesService.getNoteShareLinks(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:noteId/share/:tokenId')
  @ApiOperation({ summary: 'Ревокация ссылки' })
  revokeShareLink(
    @Param('noteId', ParseUUIDPipe) noteId: string,
    @Param('tokenId', ParseUUIDPipe) tokenId: string,
  ): Promise<void> {
    return this.sharesService.revokeNoteShareLink(noteId, tokenId);
  }
}
