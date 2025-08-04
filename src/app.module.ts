import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';
import { IamModule } from './iam/iam.module';
import { UsersModule } from './users/users.module';
import { NotesModule } from './notes/notes.module';
import { JwtModule } from '@nestjs/jwt';

type DBName = 'postgres';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        JWT_SECRET: Joi.string().required(),
        JWT_ACCESS_TTL: Joi.string().required(),
        JWT_REFRESH_TTL: Joi.string().required(),
        JWT_ISSUER: Joi.string().required(),
        JWT_AUDIENCE: Joi.string().required(),

        JWT_SHARE_SECRET: Joi.string().required(),
        JWT_SHARE_TTL: Joi.string().required(),

        DB_TYPE: Joi.string().valid('postgres').required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().integer().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_NAME: Joi.string().required(),
      }),
    }),

    TypeOrmModule.forRootAsync({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env',
        }),
        JwtModule.registerAsync({
          global: true,
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (config: ConfigService) => ({
            secret: config.get<string>('JWT_SECRET'),
            signOptions: {
              expiresIn: config.get<string>('JWT_ACCESS_TTL'),
              issuer: config.get<string>('JWT_ISSUER'),
              audience: config.get<string>('JWT_AUDIENCE'),
            },
          }),
        }),
      ],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: config.get<DBName>('DB_TYPE'),
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        entities: [__dirname + '/**/*.entities{.ts,.js}'],
        autoLoadEntities: true,
        synchronize: true,
        logging: true,
      }),
    }),

    UsersModule,
    IamModule,
    NotesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
