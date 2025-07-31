import { UsersModule } from '../users/users.module';
import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import jwtConfig from './config/jwt.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Token } from './auth/entities/token.entity';
import { Note } from '../notes/entities/note.entity';
import { NoteShareLink } from '../notes/shares/entities/note-share.entity';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    ConfigModule.forFeature(jwtConfig),
    TypeOrmModule.forFeature([User, Note, Token, NoteShareLink]),
  ],
  providers: [AuthService],
  controllers: [AuthController],

  exports: [AuthService],
})
export class IamModule {}
