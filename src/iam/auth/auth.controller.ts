import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
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
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RevokeTokenDto } from './dto/revoke-token.dto';

@ApiTags('Authentication')
@Auth(AuthType.None)
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
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
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    // TODO вывод refreshToken сделан для удобства тестирования
    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Обновление access и refresh токенов' })
  @ApiResponse({ status: 200, description: 'Успешное обновление токенов' })
  @ApiNotFoundResponse({ description: 'Недействительный refresh токен' })
  @ApiBadRequestResponse({ description: 'Невалидный формат токена' })
  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshTokens(dto.refreshToken);
  }

  @Patch('revoke')
  @ApiOperation({ summary: 'Отзыв refresh токена' })
  @ApiResponse({ status: 200, description: 'Токен успешно отозван' })
  @ApiNotFoundResponse({ description: 'Токен не найден' })
  @ApiBadRequestResponse({ description: 'Невалидный токен' })
  async revoke(@Body() dto: RevokeTokenDto): Promise<void> {
    return this.authService.revokeRefreshToken(dto.refreshToken);
  }
}
