import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config({ path: "../rwa-deploy-backend/.env" });

async function main() {
  const reserveAddress = process.env.RESERVE_ADDRESS!;
  const rwaTokenAddress = process.env.RWA_TOKEN_ADDRESS!;
  const enclaveAddress = process.env.ENCLAVE_ADDRESS!;

  console.log("🔍 Checking Reserve Configuration...");
  console.log("Reserve Address:", reserveAddress);
  console.log("Expected RWA Token:", rwaTokenAddress);
  console.log("Expected Enclave Signer:", enclaveAddress);
  console.log("");

  const Reserve = await ethers.getContractFactory("Reserve");
  const reserve = Reserve.attach(reserveAddress);

  const actualRwaToken = await reserve.rwaToken();
  const actualEnclaveSigner = await reserve.enclaveSigner();
  const owner = await reserve.owner();

  console.log("✅ Reserve Configuration:");
  console.log("Owner:", owner);
  console.log("RWA Token:", actualRwaToken);
  console.log("Enclave Signer:", actualEnclaveSigner);
  console.log("");

  // Check if configuration matches
  if (actualRwaToken.toLowerCase() === rwaTokenAddress.toLowerCase()) {
    console.log("✅ RWA Token is correctly set");
  } else {
    console.log("❌ RWA Token mismatch!");
    console.log("  Expected:", rwaTokenAddress);
    console.log("  Actual:", actualRwaToken);
  }

  if (actualEnclaveSigner.toLowerCase() === enclaveAddress.toLowerCase()) {
    console.log("✅ Enclave Signer is correctly set");
  } else {
    console.log("❌ Enclave Signer mismatch!");
    console.log("  Expected:", enclaveAddress);
    console.log("  Actual:", actualEnclaveSigner);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
