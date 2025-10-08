/*
  Standalone script (no Hardhat) to set the enclave signer on Reserve.

  Env vars required:
    PRIVATE_KEY        - Deployer private key on Hedera testnet
    RESERVE_ADDRESS    - Deployed Reserve contract address
    RPC_URL (optional) - Defaults to https://testnet.hashio.io/api

  Usage:
    PRIVATE_KEY=... RESERVE_ADDRESS=0x... node scripts/deployment/Afro/set-enclave-signer-standalone.js
*/

const { ethers } = require("ethers");

const RESERVE_ABI = [
  "function setEnclaveSigner(address newSigner) external",
  "function owner() view returns (address)"
];

async function main() {
  const pk = process.env.PRIVATE_KEY;
  const reserveAddress = process.env.RESERVE_ADDRESS;
  const rpcUrl = process.env.RPC_URL || "https://testnet.hashio.io/api";
  if (!pk) throw new Error("PRIVATE_KEY env var is required");
  if (!reserveAddress) throw new Error("RESERVE_ADDRESS env var is required");

  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(pk, provider);

  console.log("RPC:", rpcUrl);
  console.log("Deployer:", wallet.address);
  const reserve = new ethers.Contract(reserveAddress, RESERVE_ABI, wallet);

  // Generate signer keypair
  const enclaveWallet = ethers.Wallet.createRandom();
  console.log("\nENCLAVE SIGNER (SAVE THESE IN A SECURE VAULT):");
  console.log("Address:", enclaveWallet.address);
  console.log("Private Key:", enclaveWallet.privateKey);

  // Send transaction
  const tx = await reserve.setEnclaveSigner(enclaveWallet.address);
  console.log("TX:", tx.hash);
  await tx.wait();
  console.log("Done. setEnclaveSigner applied on", reserveAddress);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


