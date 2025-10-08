/*
  Usage:
    PRIVATE_KEY=... RESERVE_ADDRESS=0x... npx hardhat run scripts/deployment/Afro/set-enclave-signer.ts --network hedera-testnet

  This script generates a fresh enclave signer keypair, sets it on the Reserve contract,
  and prints the signer private key ONCE. Store it securely and use it inside your enclave.
*/

import { ethers } from "hardhat";

async function main() {
  const reserveAddress = process.env.RESERVE_ADDRESS;
  if (!reserveAddress) throw new Error("RESERVE_ADDRESS env var is required");

  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const Reserve = await ethers.getContractFactory("Reserve");
  const reserve = Reserve.attach(reserveAddress);

  // Generate a new signer keypair for the enclave
  const enclaveWallet = ethers.Wallet.createRandom();
  console.log("\nENCLAVE SIGNER (SAVE THESE IN A SECURE VAULT):")
  console.log("Address:", enclaveWallet.address);
  console.log("Private Key:", enclaveWallet.privateKey);

  const tx = await reserve.connect(deployer).setEnclaveSigner(enclaveWallet.address);
  console.log("setEnclaveSigner tx:", tx.hash);
  await tx.wait();
  console.log("Enclave signer set successfully on Reserve", reserveAddress);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


