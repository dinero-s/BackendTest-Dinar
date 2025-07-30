import { Request } from 'express';

export interface AuthRequest extends Request {
  request: { userId: string };
  user: {
    userId: string;
  };
}
