import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true, minlength: 6 })
  password: string;

  @Prop()
  profilePic?: string;

  createdAt?: Date;

  updatedAt?: Date;
}

export const userSchema = SchemaFactory.createForClass(User);
