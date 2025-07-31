import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { User } from '../../users/entities/user.entity';
import { Auth } from './decorators/auth.decorator';
import { AuthType } from './enums/auth-type.enum';
import { SignUpDto } from './dto/sign-up.dto';
import { Throttle } from '@nestjs/throttler';
import { SignInDto } from './dto/sign-in.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Token } from './entities/token.entity';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('Authentication')
@Auth(AuthType.None)
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}
  @ApiOperation({
    summary: 'Регистрация пользователя',
    description: 'Требования к паролю: минимум 8 символов в длину.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Информация о том что пользователь зарегистрирован',
    type: User,
  })
  @ApiConflictResponse({
    description: 'Информация о том что пользователь уже существует',
  })
  @ApiBadRequestResponse({
    description: 'Пароль или Email не соответствуют условиям валидации',
  })
  @Post('sign-up')
  signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @ApiOperation({
    summary: 'Вход',
    description: 'Получение токенов по email и password',
  })
  @ApiResponse({
    description: 'Access токен и Refresh токен сохранены"',
    type: String,
  })
  @Post('sign-in')
  @HttpCode(201)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async signIn(@Body() signInDto: SignInDto) {
    const { accessToken, refreshToken } =
      await this.authService.signIn(signInDto);
    const user = await this.userRepository.findOne({
      where: { email: signInDto.email },
      select: ['id'],
    });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const tokenHash = await this.authService.hashToken(refreshToken);

    await this.tokenRepository.save({
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 дней
    });

    return accessToken;
  }
}
