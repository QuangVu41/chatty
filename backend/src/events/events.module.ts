import { Module } from '@nestjs/common';
import { GatewayService } from './providers/gateway.service';

@Module({
  providers: [GatewayService],
  exports: [GatewayService],
})
export class EventsModule {}
