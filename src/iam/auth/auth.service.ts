import { UsersService } from '../../users/users.service';
import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  // ForbiddenException,
} from '@nestjs/common';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../users/entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Token } from './entities/token.entity';
// import { v4 as uuidv4 } from 'uuid';
// import { RefreshTokenPayload } from './interfaces/refresh-token-payload.interface';

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

  async revokeRefreshToken(tokenId: string): Promise<void> {
    const token = await this.tokenRepository.findOne({
      where: { tokenHash: tokenId },
    });
    if (!token) throw new NotFoundException('Токен не найден');

    token.revoked = true;
    await this.tokenRepository.save(token);
  }

  generateToken(user: User) {
    const accessToken = this.jwtService.sign(
      { userId: user.id },
      {
        expiresIn: '15m',
      },
    );
    const refreshToken = this.jwtService.sign(
      { userId: user.id },
      {
        expiresIn: '7d',
      },
    );
    return { accessToken, refreshToken };
  }

  async hashToken(token: string): Promise<string> {
    return await bcrypt.hash(token, 10);
  }
}
