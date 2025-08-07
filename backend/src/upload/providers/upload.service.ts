import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Express } from 'express';

@Injectable()
export class UploadService implements OnModuleInit {
  private s3Client: S3Client;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    this.s3Client = new S3Client({
      region: this.configService.getOrThrow<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.getOrThrow<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.getOrThrow<string>(
          'AWS_SECRET_ACCESS_KEY',
        ),
      },
    });
  }

  async uploadToS3(file: Express.Multer.File, folderName?: string) {
    const fileName = `${folderName ? `${folderName}/` : ''}${Math.random()}-${file.originalname}`;
    const buffer = file.buffer;
    let command: PutObjectCommand;

    if (process.env.AWS_BUCKET_NAME)
      command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileName,
        Body: buffer,
        ContentType: file.mimetype,
      });
    else throw new Error('Bucket name is not defined');

    await this.s3Client.send(command);

    return `${this.configService.getOrThrow<string>('AWS_CLOUDFRONT_URL')}/${fileName}`;
  }
}
