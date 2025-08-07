import { Module } from '@nestjs/common';
import { UsersService } from './providers/users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, userSchema } from 'src/models/user.model';
import { UsersController } from './users.controller';
import { UploadModule } from 'src/upload/upload.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: userSchema }]),
    UploadModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
