import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("🔧 Configuring Reserve contract with RWA Token");
  console.log("Configuring with account:", deployer.address);

  // Get Reserve contract address from environment or deployment file
  const reserveAddress =
    process.env.RESERVE_ADDRESS || "0xA879eB55AaD088A8a19E06610129d4CDb4f2c99b";

  // TODO: Replace with actual LQD Token address after deployment
  const lqdTokenAddress =
    process.env.LQD_TOKEN_ADDRESS || "YOUR_LQD_TOKEN_ADDRESS_HERE";

  console.log("\n📝 Configuration:");
  console.log("Reserve Address:", reserveAddress);
  console.log("LQD Token Address:", lqdTokenAddress);

  if (lqdTokenAddress === "YOUR_LQD_TOKEN_ADDRESS_HERE") {
    console.log("\n❌ Error: LQD_TOKEN_ADDRESS not set!");
    console.log("Please deploy the LQD token first and set the address.");
    console.log(
      "Then run: LQD_TOKEN_ADDRESS=0x... npx hardhat run scripts/deployment/AfroV1/configure-reserve-token.ts --network hedera-testnet"
    );
    process.exit(1);
  }

  // Get Reserve contract
  const Reserve = await ethers.getContractFactory("Reserve");
  const reserve = Reserve.attach(reserveAddress);

  console.log("\n🔄 Setting RWA token on Reserve...");
  const tx = await reserve.setRwaToken(lqdTokenAddress);
  console.log("Transaction hash:", tx.hash);

  await tx.wait();
  console.log("✅ Transaction confirmed!");

  // Verify the configuration
  const configuredToken = await reserve.rwaToken();
  console.log("✅ RWA Token configured:", configuredToken);

  if (configuredToken.toLowerCase() === lqdTokenAddress.toLowerCase()) {
    console.log("✅ Configuration successful!");
  } else {
    console.log("❌ Configuration mismatch!");
  }

  console.log("\n🔧 Next Steps:");
  console.log("1. Ensure Reserve is set as agent on LQD token contract");
  console.log(
    "2. Set enclave signer: npx hardhat run scripts/deployment/AfroV1/set-enclave-signer.ts --network hedera-testnet"
  );
  console.log("3. Update ENCLAVE_PRIVATE_KEY in backend .env");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
