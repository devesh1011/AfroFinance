import { ethers } from "hardhat";

async function main() {
  // --- Paste your deployed ImplementationAuthority address here ---
  const IMPLEMENTATION_AUTHORITY_ADDRESS =
    "0x50A58199E22891a1f1571efE049fb102F03D8CDd"; // <-- Replace with deployed ImplementationAuthority address

  const IdFactory = await ethers.getContractFactory("IdFactory");
  const idFactory = await IdFactory.deploy(IMPLEMENTATION_AUTHORITY_ADDRESS);
  await idFactory.deployed();
  console.log("✅ IdFactory deployed at:", idFactory.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
