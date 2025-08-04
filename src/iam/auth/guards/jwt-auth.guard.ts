import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthRequest } from '../interfaces/auth-request.interface';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    const authHeader = request.headers['authorization'];
    const token = authHeader?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Токен не предоставлен');
    }
    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      request.user = { userId: payload.userId };
      return true;
    } catch (error) {
      throw new UnauthorizedException('Неверный или просроченный токен', {
        cause: error,
      });
    }
  }
}
