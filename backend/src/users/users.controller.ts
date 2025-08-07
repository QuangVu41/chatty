import {
  Controller,
  Get,
  HttpStatus,
  ParseFilePipeBuilder,
  Patch,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './providers/users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/models/user.model';
import { TokenPayload } from 'src/auth/interfaces/token-payload.interface';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('update-profile')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('profilePic'))
  updateProfile(
    @UploadedFile(
      new ParseFilePipeBuilder().build({
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      }),
    )
    file: Express.Multer.File,
    @CurrentUser() user: any,
  ) {
    return this.usersService.updateProfile(file, user);
  }

  @Get('connected-users')
  @UseGuards(JwtAuthGuard)
  getConnectedUsers(@CurrentUser() user: any) {
    return this.usersService.getConnectedUsers(user._id);
  }
}
