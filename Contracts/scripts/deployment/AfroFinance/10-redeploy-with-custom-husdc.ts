import { ethers } from "hardhat";
import fs from "fs";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("🚀 Redeploying ConfidentialOrders with CUSTOM HUSDC");
  console.log("Deployer:", deployer.address);

  const agent = deployer.address;
  const customHusdcAddress = "0x7f4a1138bc9a86C8E75e4745C96062625A30029b";
  const reserveAddress = "0x0a15179c67aa929DE2E12da428b5d860b06e4962";

  console.log("\n📝 Config:");
  console.log("Agent:", agent);
  console.log("Custom HUSDC:", customHusdcAddress);
  console.log("Reserve (keeping):", reserveAddress);

  console.log("\n🔐 Deploying ConfidentialOrders...");
  const ConfidentialOrders = await ethers.getContractFactory(
    "ConfidentialOrders"
  );
  const orders = await ConfidentialOrders.deploy(agent, customHusdcAddress);
  await orders.deployed();

  console.log("✅ ConfidentialOrders:", orders.address);
  console.log("✅ Using HUSDC:", await orders.usdcToken());

  const info = {
    network: "hedera-testnet",
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      ConfidentialOrders: {
        address: orders.address,
        agent,
        usdcToken: customHusdcAddress,
      },
      Reserve: { address: reserveAddress },
    },
  };

  fs.writeFileSync(
    "deployment-hedera-orders-custom.json",
    JSON.stringify(info, null, 2)
  );

  console.log("\n🎉 Done!");
  console.log("\n📋 UPDATE .env.local:");
  console.log(`NEXT_PUBLIC_ORDERS_ADDRESS=${orders.address}`);
}

main().catch(console.error);
