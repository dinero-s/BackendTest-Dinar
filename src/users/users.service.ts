import {
  Body,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      const user = this.userRepository.create({
        email: createUserDto.email,
        passwordHash: hashedPassword,
      });

      await this.userRepository.save(user);

      const { passwordHash, ...result } = user;
      return result;
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Email уже используется');
      }
      throw new InternalServerErrorException(
        'Ошибка при создании пользователя',
      );
    }
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'email', 'passwordHash'],
    });
    if (!user) throw new NotFoundException('Пользователь не найден');
    const isCorrect = await bcrypt.compare(
      dto.currentPassword,
      user.passwordHash,
    );
    if (!isCorrect) {
      throw new BadRequestException('Текущий пароль неверный');
    }

    if (dto.newPassword !== dto.newPasswordConfirm) {
      throw new BadRequestException(
        'Новый пароль и подтверждение не совпадают',
      );
    }
    const password = dto.newPassword;

    const saltRounds = 10;
    user.passwordHash = await bcrypt.hash(password, saltRounds);

    await this.userRepository.save(user);
  }

  // TODO Временные эндпоинты
  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      select: ['id', 'email'],
    });
  }

  async clearUsersTable() {
    await this.userRepository.query('TRUNCATE TABLE "user" CASCADE;');
  }
}
