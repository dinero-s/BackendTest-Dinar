import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Patch,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../iam/auth/guards/jwt-auth.guard';
import { ChangePasswordDto } from './dto/change-password.dto';
import AuthenticatedRequest from './interfaces/authRequest.interface';

@Controller('users')
@ApiBearerAuth()
@ApiTags('Users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @UseGuards(JwtAuthGuard)
  @Patch('me/password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Сменить пароль вручную' })
  @ApiResponse({
    status: 200,
    description: 'Успешный запрос',
  })
  async changePassword(
    @Body() dto: ChangePasswordDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<void> {
    await this.usersService.changePassword(req.user.userId, dto);
  }
}
