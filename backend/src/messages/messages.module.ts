import { Module } from '@nestjs/common';
import { MessagesController } from './messages.controller';
import { MessagesService } from './providers/messages.service';
import { UploadModule } from 'src/upload/upload.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, messageSchema } from 'src/models/message.model';
import { EventsModule } from 'src/events/events.module';

@Module({
  imports: [
    UploadModule,
    MongooseModule.forFeature([{ name: Message.name, schema: messageSchema }]),
    EventsModule,
  ],
  controllers: [MessagesController],
  providers: [MessagesService],
})
export class MessagesModule {}
