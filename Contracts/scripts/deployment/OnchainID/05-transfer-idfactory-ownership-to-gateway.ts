import { ethers } from "hardhat";

async function main() {
  // --- Paste your deployed contract addresses here ---
  const ID_FACTORY_ADDRESS = "0xE4d8ec63714206057d87Ae49384F2058E5743b48"; // <-- Replace with deployed IdFactory address
  const GATEWAY_ADDRESS = "0xe2730ec1F1D76981FEb703Dad0e123a17B908a07"; // <-- Replace with deployed Gateway address

  const IdFactory = await ethers.getContractFactory("IdFactory");
  const idFactory = IdFactory.attach(ID_FACTORY_ADDRESS);

  const tx = await idFactory.transferOwnership(GATEWAY_ADDRESS);
  await tx.wait();

  console.log(
    `✅ IdFactory ownership transferred to Gateway at: ${GATEWAY_ADDRESS}`
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
