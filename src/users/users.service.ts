import {
  Body,
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      const user = this.userRepository.create({
        email: createUserDto.email,
        passwordHash: hashedPassword
      });

      await this.userRepository.save(user);

      const { passwordHash, ...result } = user; // что это? зачем?
      return result;

    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Email уже используется');
      }
      throw new InternalServerErrorException('Ошибка при создании пользователя');
    }
  }

  // TODO Временные эндпоинты
  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      select: ['id', 'email']
    });
  }

  async clearUsersTable() {
    await this.userRepository.query('TRUNCATE TABLE "user" CASCADE;');
  }
}