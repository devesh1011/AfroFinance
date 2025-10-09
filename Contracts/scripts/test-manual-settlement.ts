import hre from "hardhat";
import * as dotenv from "dotenv";

dotenv.config({ path: "../rwa-deploy-backend/.env" });

async function main() {
  const reserveAddress = process.env.RESERVE_ADDRESS!;
  const rwaTokenAddress = process.env.RWA_TOKEN_ADDRESS!;
  const enclavePrivateKey = process.env.ENCLAVE_PRIVATE_KEY!;
  const privateKey = process.env.PRIVATE_KEY!;

  const userAddress =
    process.argv[2] || "0xA879eB55AaD088A8a19E06610129d4CDb4f2c99b";
  const orderCommitment =
    process.argv[3] ||
    "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";

  console.log("🧪 Testing manual Reserve.settle() call...");
  console.log("Reserve Address:", reserveAddress);
  console.log("RWA Token Address:", rwaTokenAddress);
  console.log("User Address:", userAddress);
  console.log("Order Commitment:", orderCommitment);
  console.log("");

  // Create settlement payload
  const ticker = "LQD";
  const price = BigInt(Math.round(108.5 * 1e6)); // $108.5
  const usdcAmount = BigInt(1000 * 1e6); // 1000 USDC
  const tokenAmount = (usdcAmount * BigInt(1e6)) / price; // Calculate LQD amount
  const expiry = BigInt(Math.floor(Date.now() / 1000) + 3600); // 1 hour from now
  const hcsSequence = BigInt(1);

  console.log(`Price: $${Number(price) / 1e6}`);
  console.log(`USDC Amount: ${Number(usdcAmount) / 1e6} HUSDC`);
  console.log(`Token Amount: ${Number(tokenAmount) / 1e6} LQD`);
  console.log(`Expiry: ${expiry}`);
  console.log("");

  // Sign the payload
  const enclaveWallet = new hre.ethers.Wallet(enclavePrivateKey);
  const tickerHash = hre.ethers.keccak256(hre.ethers.toUtf8Bytes(ticker));

  const payloadHash = hre.ethers.keccak256(
    hre.ethers.AbiCoder.defaultAbiCoder().encode(
      [
        "bytes32",
        "address",
        "bytes32",
        "address",
        "uint256",
        "uint256",
        "uint256",
        "uint256",
        "uint256",
      ],
      [
        orderCommitment,
        userAddress,
        tickerHash,
        rwaTokenAddress,
        price,
        usdcAmount,
        tokenAmount,
        expiry,
        hcsSequence,
      ]
    )
  );

  // Add EIP-191 prefix manually
  const messagePrefix = hre.ethers.toUtf8Bytes(
    "\x19Ethereum Signed Message:\n32"
  );
  const eip191Hash = hre.ethers.keccak256(
    hre.ethers.concat([messagePrefix, hre.ethers.getBytes(payloadHash)])
  );

  const signature = enclaveWallet.signingKey.sign(eip191Hash);
  const signatureHex = hre.ethers.Signature.from(signature).serialized;

  console.log("✅ Signature created:", signatureHex.substring(0, 20) + "...");
  console.log("");

  // Call Reserve.settle()
  const [signer] = await hre.ethers.getSigners();
  const Reserve = await hre.ethers.getContractFactory("Reserve");
  const reserve = Reserve.attach(reserveAddress).connect(signer);

  console.log("📤 Calling Reserve.settle()...");
  const tx = await reserve.settle(
    orderCommitment,
    userAddress,
    ticker,
    rwaTokenAddress,
    price,
    usdcAmount,
    tokenAmount,
    expiry,
    hcsSequence,
    signatureHex
  );

  console.log("Transaction hash:", tx.hash);
  console.log("Waiting for confirmation...");
  const receipt = await tx.wait();
  console.log("✅ Settlement confirmed! Block:", receipt?.blockNumber);
  console.log("");

  // Check LQD balance
  const Token = await hre.ethers.getContractFactory("Token");
  const token = Token.attach(rwaTokenAddress);
  const balance = await token.balanceOf(userAddress);

  console.log(`User LQD balance: ${Number(balance) / 1e6} LQD`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
