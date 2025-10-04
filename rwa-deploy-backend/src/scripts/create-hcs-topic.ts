import { Client, TopicCreateTransaction, TopicMessageSubmitTransaction } from '@hashgraph/sdk';

async function main() {
  const operatorId = process.env.OPERATOR_ID;
  const operatorKey = process.env.OPERATOR_KEY;
  const memo = process.env.HCS_TOPIC_MEMO || 'order has been created!';
  if (!operatorId || !operatorKey) throw new Error('OPERATOR_ID/OPERATOR_KEY env vars required');

  const client = Client.forTestnet().setOperator(operatorId, operatorKey);

  const tx = await new TopicCreateTransaction().setTopicMemo(memo).execute(client);
  const receipt = await tx.getReceipt(client);
  const topicId = receipt.topicId;
  if (!topicId) throw new Error('No topicId in receipt');
  console.log(`Topic created: ${topicId.toString()}`);

  await new TopicMessageSubmitTransaction().setTopicId(topicId).setMessage('hello').execute(client);
  console.log('Submitted test message to topic.');

  client.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


