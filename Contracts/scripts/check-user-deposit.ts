import hre from "hardhat";
import * as dotenv from "dotenv";

dotenv.config({ path: "../rwa-deploy-backend/.env" });

async function main() {
  const ordersAddress = "0xFA6Da5BE79C2D242B6d3174644FB24Fe55290091";
  const userAddress = process.argv[2];

  if (!userAddress) {
    console.log(
      "Usage: npx hardhat run scripts/check-user-deposit.ts --network hedera-testnet <user-address>"
    );
    process.exit(1);
  }

  console.log("🔍 Checking user deposit...");
  console.log("Orders Contract:", ordersAddress);
  console.log("User Address:", userAddress);
  console.log("");

  const Orders = await hre.ethers.getContractFactory(
    "ConfidentialOrdersHedera"
  );
  const orders = Orders.attach(ordersAddress);

  const deposit = await orders.getDeposit(userAddress);

  console.log(`User deposit: ${Number(deposit) / 1e6} HUSDC`);

  // Also check HUSDC balance
  const husdcAddress = "0x7f4a1138bc9a86C8E75e4745C96062625A30029b";
  const HUSDC = await hre.ethers.getContractFactory(
    "@openzeppelin/contracts/token/ERC20/ERC20.sol:ERC20"
  );
  const husdc = HUSDC.attach(husdcAddress);

  const balance = await husdc.balanceOf(userAddress);
  const contractBalance = await husdc.balanceOf(ordersAddress);

  console.log(`User HUSDC balance: ${Number(balance) / 1e6} HUSDC`);
  console.log(`Contract HUSDC balance: ${Number(contractBalance) / 1e6} HUSDC`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
