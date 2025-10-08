import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  // Get environment variables
  const tokenAddress = process.env.RWA_TOKEN_ADDRESS || process.env.TOKEN_ADDRESS;
  const reserveAddress = process.env.RESERVE_ADDRESS;
  
  if (!tokenAddress) {
    throw new Error("RWA_TOKEN_ADDRESS or TOKEN_ADDRESS must be set in .env");
  }
  if (!reserveAddress) {
    throw new Error("RESERVE_ADDRESS must be set in .env");
  }

  const [signer] = await ethers.getSigners();
  console.log("Using signer (must be token owner):", signer.address);
  console.log("Token address:", tokenAddress);
  console.log("Reserve address to add as agent:", reserveAddress);

  // Load token contract ABI (ERC3643 Token)
  // The token contract has addAgent(address) function from AgentRole
  const tokenABI = [
    "function addAgent(address _agent) external",
    "function isAgent(address _agent) external view returns (bool)",
  ];

  const token = new ethers.Contract(tokenAddress, tokenABI, signer);

  // Check if Reserve is already an agent
  const isAlreadyAgent = await token.isAgent(reserveAddress);
  if (isAlreadyAgent) {
    console.log("✅ Reserve is already set as agent on token");
    return;
  }

  // Add Reserve as agent
  console.log("Adding Reserve as agent on token...");
  const tx = await token.addAgent(reserveAddress);
  await tx.wait();

  // Verify
  const isNowAgent = await token.isAgent(reserveAddress);
  if (isNowAgent) {
    console.log("✅ Successfully added Reserve as agent on token");
  } else {
    console.error("❌ Failed to add Reserve as agent");
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

