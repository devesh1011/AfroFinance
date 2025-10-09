import hre from "hardhat";
import * as dotenv from "dotenv";

dotenv.config({ path: "../rwa-deploy-backend/.env" });

async function main() {
  const ordersAddress = "0xFA6Da5BE79C2D242B6d3174644FB24Fe55290091";

  console.log("🔍 Checking recent BuyOrderCreated events...");
  console.log("Orders Contract:", ordersAddress);
  console.log("");

  const provider = hre.ethers.provider;

  const abi = [
    "event BuyOrderCreated(address indexed user, string ticker, address indexed token, bytes32 orderCommitment, uint256 timestamp)",
    "event Deposited(address indexed user, uint256 amount, uint256 timestamp)",
  ];

  const orders = new hre.ethers.Contract(ordersAddress, abi, provider);

  // Get recent blocks
  const currentBlock = await provider.getBlockNumber();
  const fromBlock = currentBlock - 10000; // Last ~10000 blocks

  console.log(`Searching from block ${fromBlock} to ${currentBlock}...`);
  console.log("");

  // Check Deposited events
  const depositFilter = orders.filters.Deposited();
  const depositEvents = await orders.queryFilter(
    depositFilter,
    fromBlock,
    currentBlock
  );

  console.log(`Found ${depositEvents.length} Deposited events:`);
  for (const event of depositEvents) {
    console.log(`  User: ${event.args?.user}`);
    const amount = event.args?.amount || 0n;
    console.log(`  Amount: ${Number(amount) / 1e6} HUSDC`);
    console.log(`  Block: ${event.blockNumber}`);
    console.log("");
  }

  // Check BuyOrderCreated events
  const buyFilter = orders.filters.BuyOrderCreated();
  const buyEvents = await orders.queryFilter(
    buyFilter,
    fromBlock,
    currentBlock
  );

  console.log(`Found ${buyEvents.length} BuyOrderCreated events:`);
  for (const event of buyEvents) {
    console.log(`  User: ${event.args?.user}`);
    console.log(`  Ticker: ${event.args?.ticker}`);
    console.log(`  Token: ${event.args?.token}`);
    console.log(`  Commitment: ${event.args?.orderCommitment}`);
    console.log(`  Timestamp: ${event.args?.timestamp}`);
    console.log(`  Block: ${event.blockNumber}`);
    console.log("");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
