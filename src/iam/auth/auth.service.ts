import {UsersService} from '../../users/users.service';
import {Inject, Injectable, UnauthorizedException,} from '@nestjs/common';
import {SignInDto} from './dto/sign-in.dto';
import {SignUpDto} from './dto/sign-up.dto';
import * as bcrypt from 'bcrypt';
import {InjectRepository} from "@nestjs/typeorm";
import {User} from "../../users/entities/user.entity";
import {Repository} from "typeorm";
import {JwtService} from "@nestjs/jwt";

@Injectable()
export class AuthService {
  constructor(
      private readonly usersService: UsersService,
      private readonly jwtService: JwtService,
      @InjectRepository(User)
      private readonly userRepository: Repository<User>,
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
        passwordHash: true
      }
    });
    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }
    const isPasswordValid = await bcrypt.compare(
        signInDto.password,
        user.passwordHash
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверный пароль');
    }
    return this.generateToken(user);
  }

  async generateToken(user: User) {
    const accessToken = this.jwtService.sign(
        {userId: user.id},
        {
          expiresIn: '15m'
        }
    );
    const refreshToken = this.jwtService.sign(
        {userId: user.id},
        {
          expiresIn: '7d'
        }
    );
    return { accessToken, refreshToken };
  }
}
