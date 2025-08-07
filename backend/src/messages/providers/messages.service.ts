import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from 'src/models/message.model';
import { SendMessageDto } from '../dto/send-message.dto';
import { UploadService } from 'src/upload/providers/upload.service';
import { GatewayService } from 'src/events/providers/gateway.service';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name) private readonly messageModel: Model<Message>,
    private readonly uploadService: UploadService,
    private readonly gatewayService: GatewayService,
  ) {}

  async create(message: Message) {
    const createdMessage = new this.messageModel(message);

    return (await createdMessage.save()).toObject();
  }

  async getMessagesByUserId(useToChatId: string, user: any) {
    const curUserId = user._id;

    const messages = await this.messageModel
      .find({
        $or: [
          { senderId: curUserId, receiverId: useToChatId },
          { senderId: useToChatId, receiverId: curUserId },
        ],
      })
      .sort({ createdAt: 'asc' })
      .lean(true);

    return messages;
  }

  async sendMessage(
    receiverId: string,
    user: any,
    body: SendMessageDto,
    file?: Express.Multer.File,
  ) {
    const senderId = user._id;
    let image;

    if (file)
      image = await this.uploadService.uploadToS3(file, 'message-images');

    const newMessage = await this.create({
      senderId,
      receiverId: receiverId as any,
      text: body.text,
      image,
    });

    const receiverSocketId =
      this.gatewayService.getReceiverSocketId(receiverId);
    if (receiverSocketId)
      this.gatewayService.server
        .to(receiverSocketId)
        .emit('newMessage', newMessage);

    return newMessage;
  }
}
