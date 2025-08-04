import { Request } from '@nestjs/common';

export default interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
  };
}