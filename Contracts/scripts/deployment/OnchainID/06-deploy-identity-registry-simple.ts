import { ethers } from "hardhat";

/**
 * Simple IdentityRegistry deployment for KYC-only use case
 * This deploys the minimal infrastructure needed for the backend's registerIdentity() function
 */
async function main() {
  console.log("🚀 Deploying IdentityRegistry infrastructure for Hedera...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying from:", deployer.address);

  const balance = await deployer.getBalance();
  console.log("Balance:", ethers.utils.formatEther(balance), "HBAR\n");

  // Step 1: Deploy IdentityRegistryStorage Logic
  console.log("📦 Step 1: Deploying IdentityRegistryStorage logic...");
  const IdentityRegistryStorage = await ethers.getContractFactory(
    "contracts/ERC3643/registry/implementation/IdentityRegistryStorage.sol:IdentityRegistryStorage"
  );
  const irsLogic = await IdentityRegistryStorage.deploy();
  await irsLogic.deployed();
  console.log("✅ IdentityRegistryStorage logic:", irsLogic.address);

  // Step 2: Deploy IdentityRegistryStorage Proxy
  console.log("\n📦 Step 2: Deploying IdentityRegistryStorage proxy...");
  const IdentityRegistryStorageProxy = await ethers.getContractFactory(
    "contracts/ERC3643/proxy/IdentityRegistryStorageProxy.sol:IdentityRegistryStorageProxy"
  );
  const irsProxy = await IdentityRegistryStorageProxy.deploy(irsLogic.address);
  await irsProxy.deployed();
  console.log("✅ IdentityRegistryStorage proxy:", irsProxy.address);

  // Initialize the proxy
  const irsProxyContract = await ethers.getContractAt(
    "contracts/ERC3643/registry/implementation/IdentityRegistryStorage.sol:IdentityRegistryStorage",
    irsProxy.address
  );
  const initTx = await irsProxyContract.init();
  await initTx.wait();
  console.log("✅ IdentityRegistryStorage initialized");

  // Add deployer as agent
  const addAgentTx = await irsProxyContract.addAgent(deployer.address);
  await addAgentTx.wait();
  console.log("✅ Added deployer as agent");

  // Step 3: Deploy ClaimTopicsRegistry Logic
  console.log("\n📦 Step 3: Deploying ClaimTopicsRegistry logic...");
  const ClaimTopicsRegistry = await ethers.getContractFactory(
    "contracts/ERC3643/registry/implementation/ClaimTopicsRegistry.sol:ClaimTopicsRegistry"
  );
  const ctrLogic = await ClaimTopicsRegistry.deploy();
  await ctrLogic.deployed();
  console.log("✅ ClaimTopicsRegistry logic:", ctrLogic.address);

  // Step 4: Deploy ClaimTopicsRegistry Proxy
  console.log("\n📦 Step 4: Deploying ClaimTopicsRegistry proxy...");
  const ClaimTopicsRegistryProxy = await ethers.getContractFactory(
    "contracts/ERC3643/proxy/ClaimTopicsRegistryProxy.sol:ClaimTopicsRegistryProxy"
  );
  const ctrProxy = await ClaimTopicsRegistryProxy.deploy(ctrLogic.address);
  await ctrProxy.deployed();
  console.log("✅ ClaimTopicsRegistry proxy:", ctrProxy.address);

  // Initialize and configure ClaimTopicsRegistry
  const ctrProxyContract = await ethers.getContractAt(
    "contracts/ERC3643/registry/implementation/ClaimTopicsRegistry.sol:ClaimTopicsRegistry",
    ctrProxy.address
  );
  const ctrInitTx = await ctrProxyContract.init();
  await ctrInitTx.wait();
  console.log("✅ ClaimTopicsRegistry initialized");

  // Add KYC topic (topic 1)
  const addTopicTx = await ctrProxyContract.addClaimTopic(1);
  await addTopicTx.wait();
  console.log("✅ Added claim topic 1 (KYC)");

  // Step 5: Deploy TrustedIssuersRegistry Logic
  console.log("\n📦 Step 5: Deploying TrustedIssuersRegistry logic...");
  const TrustedIssuersRegistry = await ethers.getContractFactory(
    "contracts/ERC3643/registry/implementation/TrustedIssuersRegistry.sol:TrustedIssuersRegistry"
  );
  const tirLogic = await TrustedIssuersRegistry.deploy();
  await tirLogic.deployed();
  console.log("✅ TrustedIssuersRegistry logic:", tirLogic.address);

  // Step 6: Deploy TrustedIssuersRegistry Proxy
  console.log("\n📦 Step 6: Deploying TrustedIssuersRegistry proxy...");
  const TrustedIssuersRegistryProxy = await ethers.getContractFactory(
    "contracts/ERC3643/proxy/TrustedIssuersRegistryProxy.sol:TrustedIssuersRegistryProxy"
  );
  const tirProxy = await TrustedIssuersRegistryProxy.deploy(tirLogic.address);
  await tirProxy.deployed();
  console.log("✅ TrustedIssuersRegistry proxy:", tirProxy.address);

  // Initialize and configure TrustedIssuersRegistry
  const tirProxyContract = await ethers.getContractAt(
    "contracts/ERC3643/registry/implementation/TrustedIssuersRegistry.sol:TrustedIssuersRegistry",
    tirProxy.address
  );
  const tirInitTx = await tirProxyContract.init();
  await tirInitTx.wait();
  console.log("✅ TrustedIssuersRegistry initialized");

  // Add the issuer from .env as trusted
  const ISSUER_ADDRESS = "0xfBbB54Ea804cC2570EeAba2fea09d0c66582498F"; // Your issuer address
  const addIssuerTx = await tirProxyContract.addTrustedIssuer(
    ISSUER_ADDRESS,
    [1] // Claim topics this issuer can sign (1 = KYC)
  );
  await addIssuerTx.wait();
  console.log("✅ Added trusted issuer:", ISSUER_ADDRESS);

  // Step 7: Deploy IdentityRegistry Logic
  console.log("\n📦 Step 7: Deploying IdentityRegistry logic...");
  const IdentityRegistry = await ethers.getContractFactory(
    "contracts/ERC3643/registry/implementation/IdentityRegistry.sol:IdentityRegistry"
  );
  const irLogic = await IdentityRegistry.deploy();
  await irLogic.deployed();
  console.log("✅ IdentityRegistry logic:", irLogic.address);

  // Step 8: Deploy IdentityRegistry Proxy
  console.log("\n📦 Step 8: Deploying IdentityRegistry proxy...");
  const IdentityRegistryProxy = await ethers.getContractFactory(
    "contracts/ERC3643/proxy/IdentityRegistryProxy.sol:IdentityRegistryProxy"
  );
  const irProxy = await IdentityRegistryProxy.deploy(
    irLogic.address,
    tirProxy.address,
    ctrProxy.address,
    irsProxy.address
  );
  await irProxy.deployed();
  console.log("✅ IdentityRegistry proxy:", irProxy.address);

  // Initialize IdentityRegistry
  const irProxyContract = await ethers.getContractAt(
    "contracts/ERC3643/registry/implementation/IdentityRegistry.sol:IdentityRegistry",
    irProxy.address
  );
  const irInitTx = await irProxyContract.init();
  await irInitTx.wait();
  console.log("✅ IdentityRegistry initialized");

  // Add deployer as agent on IdentityRegistry
  const irAddAgentTx = await irProxyContract.addAgent(deployer.address);
  await irAddAgentTx.wait();
  console.log("✅ Added deployer as agent on IdentityRegistry");

  // Step 9: Bind IdentityRegistry to IdentityRegistryStorage
  console.log("\n📦 Step 9: Binding contracts...");
  const bindTx = await irsProxyContract.bindIdentityRegistry(irProxy.address);
  await bindTx.wait();
  console.log("✅ Bound IdentityRegistry to IdentityRegistryStorage");

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("=".repeat(60));
  console.log("\n📋 Contract Addresses:");
  console.log("━".repeat(60));
  console.log("IdentityRegistryStorage Logic:", irsLogic.address);
  console.log("IdentityRegistryStorage Proxy:", irsProxy.address);
  console.log("ClaimTopicsRegistry Logic:    ", ctrLogic.address);
  console.log("ClaimTopicsRegistry Proxy:    ", ctrProxy.address);
  console.log("TrustedIssuersRegistry Logic: ", tirLogic.address);
  console.log("TrustedIssuersRegistry Proxy: ", tirProxy.address);
  console.log("IdentityRegistry Logic:       ", irLogic.address);
  console.log("IdentityRegistry Proxy:       ", irProxy.address);
  console.log("━".repeat(60));
  console.log("\n⚙️  Configuration:");
  console.log("━".repeat(60));
  console.log("Claim Topic Added: 1 (KYC)");
  console.log("Trusted Issuer:", ISSUER_ADDRESS);
  console.log("Agent:", deployer.address);
  console.log("━".repeat(60));
  console.log("\n🔧 Update your backend .env:");
  console.log(`IDENTITY_REGISTRY_ADDRESS="${irProxy.address}"`);
  console.log("\n✅ Ready to use for KYC registrations!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
