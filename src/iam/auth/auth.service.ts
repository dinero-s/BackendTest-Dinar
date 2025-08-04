import { UsersService } from '../../users/users.service';
import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../users/entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Token } from './entities/token.entity';
import * as process from 'node:process';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    return await this.usersService.create(signUpDto);
  }

  async signIn(signInDto: SignInDto) {
    const user = await this.userRepository.findOne({
      where: { email: signInDto.email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
      },
    });
    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }
    const isPasswordValid = await bcrypt.compare(
      signInDto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверный пароль');
    }
    return this.generateToken(user);
  }

  async revokeRefreshToken(refreshToken: string): Promise<void> {
    try {
      const payload = this.jwtService.verify<{
        sub: string;
        tokenId: string;
      }>(refreshToken, {
        secret: process.env.JWT_SECRET,
      });

      const token = await this.tokenRepository.findOne({
        where: { tokenId: payload.tokenId },
      });

      if (!token) {
        throw new NotFoundException('Токен не найден');
      }
      await this.tokenRepository.remove(token);
    } catch (error) {
      console.error('Ошибка при отзыве токена:', error);
      throw new InternalServerErrorException('Ошибка при отзыве токена', {
        cause: error,
      });
    }
  }

  generateToken(user: { id: string }) {
    const accessToken = this.jwtService.sign(
      { userId: user.id },
      {
        expiresIn: process.env.JWT_ACCESS_TTL,
      },
    );
    const refreshToken = this.jwtService.sign(
      { userId: user.id },
      {
        expiresIn: process.env.JWT_REFRESH_TTL,
      },
    );
    return { accessToken, refreshToken };
  }

  async refreshTokens(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = this.jwtService.verify<{ userId: string }>(refreshToken, {
      secret: process.env.JWT_REFRESH_SECRET,
    });

    const tokens = await this.tokenRepository.find({
      where: { userId: payload.userId },
    });

    let matched: Token | null = null;

    for (const token of tokens) {
      const isMatch = await this.compareToken(refreshToken, token.tokenHash);
      if (isMatch) {
        matched = token;
        break;
      }
    }

    if (!matched) {
      throw new NotFoundException('Неверный refresh token');
    }

    const { accessToken, refreshToken: newRefreshToken } = this.generateToken({
      id: payload.userId,
    });

    matched.tokenHash = await this.hashToken(newRefreshToken);
    await this.tokenRepository.save(matched);

    return { accessToken, refreshToken: newRefreshToken };
  }

  async hashToken(token: string): Promise<string> {
    return await bcrypt.hash(token, 10);
  }

  async compareToken(token: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(token, hash);
  }
}
