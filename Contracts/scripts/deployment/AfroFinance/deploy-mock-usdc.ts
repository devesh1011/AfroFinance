import { ethers } from "hardhat";

async function main() {
  const recipient = process.env.MOCK_USDC_RECIPIENT || (await ethers.getSigners())[0].address;
  const mintAmount = process.env.MOCK_USDC_MINT || (1_000_000n * 1_000_000n).toString(); // 1,000,000 HUSDC (6dp)

  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);
  console.log("Recipient:", recipient);
  console.log("Mint:", mintAmount.toString());

  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const husdc = await MockUSDC.deploy(recipient, mintAmount);
  console.log("Deploying MockUSDC...");
  await husdc.deployed();
  console.log("MockUSDC:", husdc.address);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


