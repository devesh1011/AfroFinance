import { ethers } from "hardhat";

async function main() {
  // --- Paste your deployed IdFactory address here ---
  const ID_FACTORY_ADDRESS = "0xE4d8ec63714206057d87Ae49384F2058E5743b48"; // <-- Replace with deployed IdFactory address

  // --- Optionally, add approved signer addresses here ---
  const SIGNERS_TO_APPROVE: string[] = [
    "0xA879eB55AaD088A8a19E06610129d4CDb4f2c99b",
  ];

  const Gateway = await ethers.getContractFactory("Gateway");
  const gateway = await Gateway.deploy(ID_FACTORY_ADDRESS, SIGNERS_TO_APPROVE);
  await gateway.deployed();
  console.log("✅ Gateway deployed at:", gateway.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
