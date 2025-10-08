import { ethers } from "hardhat";

/**
 * Direct IdentityRegistry deployment (no proxies) for Hedera KYC
 * This is simpler and avoids proxy complexity
 */
async function main() {
  console.log("🚀 Deploying IdentityRegistry (direct) for Hedera...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying from:", deployer.address);

  const balance = await deployer.getBalance();
  console.log("Balance:", ethers.utils.formatEther(balance), "HBAR\n");

  // Step 1: Deploy IdentityRegistryStorage
  console.log("📦 Step 1: Deploying IdentityRegistryStorage...");
  const IdentityRegistryStorage = await ethers.getContractFactory(
    "contracts/ERC3643/registry/implementation/IdentityRegistryStorage.sol:IdentityRegistryStorage"
  );
  const identityRegistryStorage = await IdentityRegistryStorage.deploy();
  await identityRegistryStorage.deployed();
  console.log("✅ IdentityRegistryStorage:", identityRegistryStorage.address);

  // Initialize it
  await identityRegistryStorage.init();
  console.log("✅ Initialized IdentityRegistryStorage");

  // Add deployer as agent
  await identityRegistryStorage.addAgent(deployer.address);
  console.log("✅ Added deployer as agent");

  // Step 2: Deploy ClaimTopicsRegistry
  console.log("\n📦 Step 2: Deploying ClaimTopicsRegistry...");
  const ClaimTopicsRegistry = await ethers.getContractFactory(
    "contracts/ERC3643/registry/implementation/ClaimTopicsRegistry.sol:ClaimTopicsRegistry"
  );
  const claimTopicsRegistry = await ClaimTopicsRegistry.deploy();
  await claimTopicsRegistry.deployed();
  console.log("✅ ClaimTopicsRegistry:", claimTopicsRegistry.address);

  // Initialize and add KYC topic
  await claimTopicsRegistry.init();
  console.log("✅ Initialized ClaimTopicsRegistry");

  await claimTopicsRegistry.addClaimTopic(1); // KYC topic
  console.log("✅ Added claim topic 1 (KYC)");

  // Step 3: Deploy TrustedIssuersRegistry
  console.log("\n📦 Step 3: Deploying TrustedIssuersRegistry...");
  const TrustedIssuersRegistry = await ethers.getContractFactory(
    "contracts/ERC3643/registry/implementation/TrustedIssuersRegistry.sol:TrustedIssuersRegistry"
  );
  const trustedIssuersRegistry = await TrustedIssuersRegistry.deploy();
  await trustedIssuersRegistry.deployed();
  console.log("✅ TrustedIssuersRegistry:", trustedIssuersRegistry.address);

  // Initialize and add trusted issuer
  await trustedIssuersRegistry.init();
  console.log("✅ Initialized TrustedIssuersRegistry");

  const ISSUER_ADDRESS = "0xfBbB54Ea804cC2570EeAba2fea09d0c66582498F";
  await trustedIssuersRegistry.addTrustedIssuer(ISSUER_ADDRESS, [1]);
  console.log("✅ Added trusted issuer:", ISSUER_ADDRESS);

  // Step 4: Deploy IdentityRegistry
  console.log("\n📦 Step 4: Deploying IdentityRegistry...");
  const IdentityRegistry = await ethers.getContractFactory(
    "contracts/ERC3643/registry/implementation/IdentityRegistry.sol:IdentityRegistry"
  );
  const identityRegistry = await IdentityRegistry.deploy();
  await identityRegistry.deployed();
  console.log("✅ IdentityRegistry:", identityRegistry.address);

  // Initialize with dependencies
  await identityRegistry.init(
    trustedIssuersRegistry.address,
    claimTopicsRegistry.address,
    identityRegistryStorage.address
  );
  console.log("✅ Initialized IdentityRegistry");

  // Add deployer as agent
  await identityRegistry.addAgent(deployer.address);
  console.log("✅ Added deployer as agent on IdentityRegistry");

  // Step 5: Bind IdentityRegistry to Storage
  console.log("\n📦 Step 5: Binding contracts...");
  await identityRegistryStorage.bindIdentityRegistry(identityRegistry.address);
  console.log("✅ Bound IdentityRegistry to IdentityRegistryStorage");

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("=".repeat(60));
  console.log("\n📋 Contract Addresses:");
  console.log("━".repeat(60));
  console.log("IdentityRegistryStorage: ", identityRegistryStorage.address);
  console.log("ClaimTopicsRegistry:     ", claimTopicsRegistry.address);
  console.log("TrustedIssuersRegistry:  ", trustedIssuersRegistry.address);
  console.log("IdentityRegistry:        ", identityRegistry.address);
  console.log("━".repeat(60));
  console.log("\n⚙️  Configuration:");
  console.log("━".repeat(60));
  console.log("Claim Topic: 1 (KYC)");
  console.log("Trusted Issuer:", ISSUER_ADDRESS);
  console.log("Agent:", deployer.address);
  console.log("━".repeat(60));
  console.log("\n🔧 Update your backend .env:");
  console.log(`IDENTITY_REGISTRY_ADDRESS="${identityRegistry.address}"`);
  console.log("\n✅ Ready for KYC registrations!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
