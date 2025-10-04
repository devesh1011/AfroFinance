import { Injectable, Logger } from '@nestjs/common';
import { Client, TopicMessageSubmitTransaction, TopicId } from '@hashgraph/sdk';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class HcsPublisherService {
  private readonly logger = new Logger(HcsPublisherService.name);

  constructor(private readonly config: ConfigService) {}

  private getClient(): Client {
    const operatorId = this.config.get<string>('OPERATOR_ID');
    const operatorKey = this.config.get<string>('OPERATOR_KEY');
    if (!operatorId || !operatorKey) {
      throw new Error('Missing OPERATOR_ID/OPERATOR_KEY');
    }
    return Client.forTestnet().setOperator(operatorId, operatorKey);
  }

  async publishOrdersMessage(payload: Uint8Array | string) {
    const topicIdStr = this.config.get<string>('HCS_ORDERS_TOPIC_ID');
    if (!topicIdStr) throw new Error('HCS_ORDERS_TOPIC_ID not set');
    const topicId = TopicId.fromString(topicIdStr);
    const client = this.getClient();
    try {
      const tx = await new TopicMessageSubmitTransaction()
        .setTopicId(topicId)
        .setMessage(payload)
        .execute(client);
      const receipt = await tx.getReceipt(client);
      this.logger.log(`HCS publish status: ${receipt.status.toString()}`);
      return { status: receipt.status.toString() };
    } finally {
      client.close();
    }
  }
}
