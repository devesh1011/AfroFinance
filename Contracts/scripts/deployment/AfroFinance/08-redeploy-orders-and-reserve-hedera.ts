import { ethers } from "hardhat";
import fs from "fs";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log(
    "🚀 Redeploying ConfidentialOrders and Reserve contracts on Hedera Testnet"
  );
  console.log("Deploying with account:", deployer.address);
  console.log(
    "Account balance:",
    ethers.utils.formatEther(await deployer.getBalance()),
    "HBAR"
  );

  // Configuration
  const agent = deployer.address; // Agent is the deployer
  const usdcAddress = "0x0000000000000000000000000000000000068cda"; // Hedera USDC (WHBAR for testing)
  const owner = deployer.address;

  console.log("\n📝 Configuration:");
  console.log("Agent/Owner:", agent);
  console.log("USDC Token:", usdcAddress);

  // ==========================================
  // 1. Deploy ConfidentialOrders
  // ==========================================
  console.log("\n🔐 Deploying ConfidentialOrders contract...");

  const ConfidentialOrders = await ethers.getContractFactory(
    "ConfidentialOrders"
  );
  const confidentialOrders = await ConfidentialOrders.deploy(
    agent,
    usdcAddress
  );
  await confidentialOrders.deployed();
  const ordersAddress = confidentialOrders.address;

  console.log("✅ ConfidentialOrders deployed at:", ordersAddress);

  // Verify deployment
  const ordersAgent = await confidentialOrders.agent();
  const ordersUsdc = await confidentialOrders.usdcToken();
  console.log("✅ Agent:", ordersAgent);
  console.log("✅ USDC Token:", ordersUsdc);

  // ==========================================
  // 2. Deploy Reserve
  // ==========================================
  console.log("\n💰 Deploying Reserve contract...");

  const Reserve = await ethers.getContractFactory("Reserve");
  const reserve = await Reserve.deploy(owner);
  await reserve.deployed();
  const reserveAddress = reserve.address;

  console.log("✅ Reserve deployed at:", reserveAddress);

  // Verify deployment
  const reserveOwner = await reserve.owner();
  console.log("✅ Owner:", reserveOwner);

  // ==========================================
  // 3. Update configuration files
  // ==========================================
  console.log("\n📝 Updating configuration files...");

  // Update ConfidentialOrders ABI
  const ordersAbiPath = "./abi/orders.json";
  const ordersAbiData = {
    address: ordersAddress,
    abi: ConfidentialOrders.interface.format(ethers.utils.FormatTypes.json),
  };
  fs.writeFileSync(ordersAbiPath, JSON.stringify(ordersAbiData, null, 2));
  console.log("✅ Updated abi/orders.json");

  // Update Reserve ABI
  const reserveAbiPath = "./abi/reserve.json";
  const reserveAbiData = {
    address: reserveAddress,
    abi: Reserve.interface.format(ethers.utils.FormatTypes.json),
  };
  fs.writeFileSync(reserveAbiPath, JSON.stringify(reserveAbiData, null, 2));
  console.log("✅ Updated abi/reserve.json");

  // ==========================================
  // 4. Display summary and next steps
  // ==========================================
  console.log("\n✅ Deployment Complete!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📊 Deployment Summary:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("ConfidentialOrders:", ordersAddress);
  console.log("Reserve:", reserveAddress);
  console.log("Agent:", agent);
  console.log("Owner:", owner);
  console.log("USDC Token:", usdcAddress);

  console.log("\n🔧 Next Steps:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("1. Update backend .env file:");
  console.log(`   RESERVE_ADDRESS=${reserveAddress}`);
  console.log(`   ORDER_CONTRACT_ADDRESS=${ordersAddress}`);
  console.log("");
  console.log("2. Set RWA Token on Reserve:");
  console.log(
    `   npx hardhat run scripts/deployment/Afro/configure-reserve-token.ts --network hedera-testnet`
  );
  console.log("");
  console.log("3. Set Enclave Signer on Reserve:");
  console.log(
    `   npx hardhat run scripts/deployment/Afro/set-enclave-signer.ts --network hedera-testnet`
  );
  console.log("");
  console.log(
    "4. Update frontend .env.local (if it references these addresses):"
  );
  console.log(`   NEXT_PUBLIC_ORDERS_ADDRESS=${ordersAddress}`);
  console.log(`   NEXT_PUBLIC_RESERVE_ADDRESS=${reserveAddress}`);
  console.log("");
  console.log("5. Restart backend and frontend services");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  // Save deployment info to a file
  const deploymentInfo = {
    network: "hedera-testnet",
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      ConfidentialOrders: {
        address: ordersAddress,
        agent: ordersAgent,
        usdcToken: ordersUsdc,
      },
      Reserve: {
        address: reserveAddress,
        owner: reserveOwner,
      },
    },
  };

  fs.writeFileSync(
    "./deployment-hedera-orders-reserve.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log(
    "\n✅ Deployment info saved to deployment-hedera-orders-reserve.json"
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
