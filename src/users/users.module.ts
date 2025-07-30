import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { IamModule } from '../iam/iam.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), forwardRef(() => IamModule)],
  controllers: [UsersController],
  providers: [UsersService],

  exports: [UsersService],
})
export class UsersModule {}
