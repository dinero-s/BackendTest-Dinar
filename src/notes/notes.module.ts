import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Note } from './entities/note.entity';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';
import { User } from '../users/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { NoteShareLink } from './shares/entities/note-share.entity';
import { SharesService } from './shares/shares.service';

@Module({
  imports: [TypeOrmModule.forFeature([Note, User, NoteShareLink]), JwtModule],
  controllers: [NotesController],
  providers: [NotesService, SharesService],
})
export class NotesModule {}
