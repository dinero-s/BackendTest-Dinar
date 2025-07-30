import { Module } from '@nestjs/common';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Note} from "./entities/note.entity";
import {NotesController} from "./notes.controller";
import {NotesService} from "./notes.service";
import {User} from "../users/entities/user.entity";
import {JwtModule} from "@nestjs/jwt";

@Module({
    imports: [
        TypeOrmModule.forFeature([Note, User]),
        JwtModule],
    controllers: [NotesController],
    providers: [NotesService],
})
export class NotesModule {}
