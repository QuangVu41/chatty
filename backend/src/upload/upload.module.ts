import { Module } from '@nestjs/common';
import { UploadService } from './providers/upload.service';

@Module({
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
