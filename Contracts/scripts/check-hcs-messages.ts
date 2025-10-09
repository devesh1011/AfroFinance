import { Client, TopicId, TopicMessageQuery } from "@hashgraph/sdk";
import * as dotenv from "dotenv";

dotenv.config({ path: "../rwa-deploy-backend/.env" });

async function main() {
  const topicId = process.env.HCS_ORDERS_TOPIC_ID || "0.0.7166619";

  console.log("🔍 Checking HCS Topic Messages...");
  console.log("Topic ID:", topicId);
  console.log("");

  const client = Client.forTestnet();

  let messageCount = 0;
  const messages: any[] = [];

  await new Promise<void>((resolve, reject) => {
    new TopicMessageQuery()
      .setTopicId(topicId)
      .setStartTime(0)
      .setLimit(10) // Get last 10 messages
      .subscribe(
        client,
        (message, error) => {
          if (error) {
            console.error("❌ Error:", error.message);
            return;
          }

          if (message) {
            messageCount++;
            const seq = message.sequenceNumber.toString();
            const contents = Buffer.from(message.contents).toString("utf-8");
            console.log(`📨 Message ${messageCount} (seq: ${seq})`);

            try {
              const parsed = JSON.parse(contents);
              console.log("  User:", parsed.user);
              console.log("  Ticker:", parsed.ticker);
              console.log("  Side:", parsed.side);
              console.log(
                "  Commitment:",
                parsed.commitment.substring(0, 20) + "..."
              );
              console.log("");
              messages.push(parsed);
            } catch (e) {
              console.log("  Raw:", contents.substring(0, 100));
              console.log("");
            }
          }
        },
        () => {
          // Complete
          setTimeout(() => {
            console.log(`✅ Total messages found: ${messageCount}`);
            client.close();
            resolve();
          }, 2000);
        }
      );
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
