import { UsersModule } from '../users/users.module';
import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import jwtConfig from './config/jwt.config';
import {TypeOrmModule} from "@nestjs/typeorm";
import {User} from "../users/entities/user.entity";
import {Token} from "./auth/entities/token.entity";
import {Note} from "../notes/entities/note.entity";

@Module({
  imports: [
    forwardRef(() => UsersModule),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
    TypeOrmModule.forFeature([User, Note, Token])
  ],
  providers: [ AuthService ],
  controllers: [ AuthController ],

  exports: [ AuthService ],
})
export class IamModule {}
