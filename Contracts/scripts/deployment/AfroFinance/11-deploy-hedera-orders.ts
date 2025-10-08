import { ethers } from "hardhat";
import fs from "fs";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("🚀 Deploying ConfidentialOrdersHedera (No Chainlink)");
  console.log("Deployer:", deployer.address);

  const agent = deployer.address;
  const customHusdcAddress = "0x7f4a1138bc9a86C8E75e4745C96062625A30029b";
  const reserveAddress = "0x0a15179c67aa929DE2E12da428b5d860b06e4962";

  console.log("\n📝 Config:");
  console.log("Agent:", agent);
  console.log("Custom HUSDC:", customHusdcAddress);
  console.log("Reserve (keeping):", reserveAddress);

  console.log("\n🔐 Deploying ConfidentialOrdersHedera...");
  const ConfidentialOrdersHedera = await ethers.getContractFactory(
    "ConfidentialOrdersHedera"
  );
  const orders = await ConfidentialOrdersHedera.deploy(
    agent,
    customHusdcAddress
  );
  await orders.deployed();

  console.log("✅ ConfidentialOrdersHedera:", orders.address);
  console.log("✅ Using HUSDC:", await orders.usdcToken());
  console.log("✅ Agent:", await orders.agent());

  const info = {
    network: "hedera-testnet",
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      ConfidentialOrdersHedera: {
        address: orders.address,
        agent,
        usdcToken: customHusdcAddress,
        note: "Simplified version without Chainlink Functions for Hedera",
      },
      Reserve: { address: reserveAddress },
    },
  };

  fs.writeFileSync(
    "deployment-hedera-orders-hedera.json",
    JSON.stringify(info, null, 2)
  );

  console.log("\n🎉 Done!");
  console.log("\n📋 UPDATE .env.local:");
  console.log(`NEXT_PUBLIC_ORDERS_ADDRESS=${orders.address}`);
  console.log("\n💡 This version:");
  console.log("- No Chainlink Functions dependency");
  console.log("- Simplified buyAsset() - just emits event + stores commitment");
  console.log("- Backend handles pricing via HCS messages");
  console.log("- Works natively on Hedera without oracle setup");
}

main().catch(console.error);
