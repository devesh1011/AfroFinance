import { Body, Controller, Post } from '@nestjs/common';
import { HcsPublisherService } from './hcs.publisher';

@Controller('web3/hcs')
export class HcsController {
  constructor(private readonly publisher: HcsPublisherService) {}

  // Generic publisher endpoint: accepts arbitrary JSON and forwards to HCS as a string
  @Post('orders')
  async publishOrder(@Body() body: any) {
    const message = JSON.stringify({
      ...body,
      ts: Math.floor(Date.now() / 1000),
    });
    return this.publisher.publishOrdersMessage(message);
  }
}
