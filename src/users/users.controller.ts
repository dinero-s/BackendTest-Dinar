import {
  Controller,
  Post,
  Body, Get,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import {

  ApiBearerAuth, ApiOperation, ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {User} from "./entities/user.entity";


@Controller('users')
@ApiBearerAuth()
@ApiTags('Users')
export class UsersController {
  constructor(
      private readonly usersService: UsersService) {}

  @Post('create')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
  @Get()
  @ApiOperation({ summary: 'Получить всех пользователей' })
  @ApiResponse({
    status: 200,
    description: 'Успешный запрос',
    type: [User]
  })
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get('delete')
  @ApiOperation({ summary: 'Удалить всех пользователей' })
  @ApiResponse({
    status: 200,
    description: 'Успешный запрос',
  })
  async clearUsersTable() {
    return this.usersService.clearUsersTable();
  }
}
