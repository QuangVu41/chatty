import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, UpdateQuery } from 'mongoose';
import { User } from 'src/models/user.model';
import { UploadService } from 'src/upload/providers/upload.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly uploadService: UploadService,
  ) {}

  async findOne(filter: FilterQuery<User>) {
    const user = await this.userModel.findOne(filter).lean(true);

    return user;
  }

  async create(user: User) {
    const createdUser = new this.userModel(user);

    return (await createdUser.save()).toObject();
  }

  async findById(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .select('-password')
      .lean(true);

    return user;
  }

  async findByIdAndUpdate(userId: string, update: UpdateQuery<User>) {
    return await this.userModel
      .findByIdAndUpdate(userId, update, { new: true })
      .lean(true);
  }

  async updateProfile(file: Express.Multer.File, user: any) {
    try {
      const userId = user._id;

      const imageUrl = await this.uploadService.uploadToS3(
        file,
        'profile-pics',
      );
      const updatedUser = await this.findByIdAndUpdate(userId, {
        profilePic: imageUrl,
      });

      return updatedUser;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async getConnectedUsers(userId: string) {
    return await this.userModel
      .find({ _id: { $ne: userId } })
      .select('-password')
      .lean(true);
  }
}
