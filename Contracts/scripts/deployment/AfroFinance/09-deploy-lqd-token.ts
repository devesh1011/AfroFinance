import { ethers } from "hardhat";
import fs from "fs";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("🪙 Deploying LQD Token on Hedera Testnet");
  console.log("Deploying with account:", deployer.address);
  console.log(
    "Account balance:",
    ethers.utils.formatEther(await deployer.getBalance()),
    "HBAR"
  );

  // Token configuration
  const tokenName = "Afro Finance LQD";
  const tokenSymbol = "LQD";
  const owner = deployer.address;

  console.log("\n📝 Token Configuration:");
  console.log("Name:", tokenName);
  console.log("Symbol:", tokenSymbol);
  console.log("Owner:", owner);
  console.log("Decimals: 18 (standard ERC20)");

  // Deploy LQDToken
  console.log("\n🚀 Deploying LQDToken contract...");
  const LQDToken = await ethers.getContractFactory("LQDToken");
  const lqdToken = await LQDToken.deploy(tokenName, tokenSymbol, owner);
  await lqdToken.deployed();
  const tokenAddress = lqdToken.address;

  console.log("✅ LQD Token deployed at:", tokenAddress);

  // Verify deployment
  const name = await lqdToken.name();
  const symbol = await lqdToken.symbol();
  const decimals = await lqdToken.decimals();
  const tokenOwner = await lqdToken.owner();

  console.log("\n✅ Deployment Verification:");
  console.log("Name:", name);
  console.log("Symbol:", symbol);
  console.log("Decimals:", decimals.toString());
  console.log("Owner:", tokenOwner);

  // Update ABI file
  const abiPath = "./abi/token.json";
  const abiData = {
    address: tokenAddress,
    abi: LQDToken.interface.format(ethers.utils.FormatTypes.json),
  };
  fs.writeFileSync(abiPath, JSON.stringify(abiData, null, 2));
  console.log("✅ Updated abi/token.json");

  // Save deployment info
  const deploymentInfo = {
    network: "hedera-testnet",
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    token: {
      name: tokenName,
      symbol: tokenSymbol,
      address: tokenAddress,
      decimals: 18,
      owner: tokenOwner,
    },
  };

  fs.writeFileSync(
    "./deployment-lqd-token.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("✅ Deployment info saved to deployment-lqd-token.json");

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ LQD Token Deployment Complete!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Token Address:", tokenAddress);
  console.log("Token Name:", tokenName);
  console.log("Token Symbol:", tokenSymbol);
  console.log("Decimals: 18");
  console.log("Owner:", owner);

  console.log("\n🔧 Next Steps:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("1. Set RWA Token on Reserve:");
  console.log(
    `   LQD_TOKEN_ADDRESS=${tokenAddress} npx hardhat run scripts/deployment/Afro/configure-reserve-token.ts --network hedera-testnet`
  );
  console.log("");
  console.log("2. Add Reserve as Agent on LQD Token:");
  console.log(
    `   LQD_TOKEN_ADDRESS=${tokenAddress} npx hardhat run scripts/deployment/Afro/set-reserve-as-agent.ts --network hedera-testnet`
  );
  console.log("");
  console.log("3. Update Backend .env:");
  console.log(`   RWA_TOKEN_ADDRESS=${tokenAddress}`);
  console.log("");
  console.log("4. Update Frontend .env.local:");
  console.log(`   NEXT_PUBLIC_RWA_TOKEN_ADDRESS=${tokenAddress}`);
  console.log("");
  console.log("5. Restart backend and frontend services");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
