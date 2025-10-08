import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const agent = process.env.ORDERS_AGENT || deployer.address;
  const usdc = process.env.HUSDC_ADDRESS;
  if (!usdc) throw new Error("HUSDC_ADDRESS env var required (mock HUSDC address)");

  console.log("Deployer:", deployer.address);
  console.log("Agent:", agent);
  console.log("HUSDC:", usdc);

  const Orders = await ethers.getContractFactory("ConfidentialOrders");
  const orders = await Orders.deploy(agent, usdc);
  console.log("Deploying ConfidentialOrders...");
  await orders.deployed();
  console.log("ConfidentialOrders:", orders.address);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


