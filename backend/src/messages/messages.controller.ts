import {
  Body,
  Controller,
  Get,
  Param,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { MessagesService } from './providers/messages.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { SendMessageDto } from './dto/send-message.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('{:id}')
  @UseGuards(JwtAuthGuard)
  getMessagesByUserId(
    @Param('id') useToChatId: string,
    @CurrentUser() user: any,
  ) {
    return this.messagesService.getMessagesByUserId(useToChatId, user);
  }

  @Post('send-message/{:id}')
  @UseInterceptors(FileInterceptor('image'))
  @UseGuards(JwtAuthGuard)
  sendMessage(
    @Param('id') receiverId: string,
    @CurrentUser() user: any,
    @Body() body: SendMessageDto,
    @UploadedFile(
      new ParseFilePipeBuilder().build({
        fileIsRequired: false,
      }),
    )
    file?: Express.Multer.File,
  ) {
    return this.messagesService.sendMessage(receiverId, user, body, file);
  }
}
