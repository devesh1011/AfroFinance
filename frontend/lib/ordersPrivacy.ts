// Minimal AES-GCM encrypt + commitment + backend HCS publish helper

export type EncryptedOrder = {
  ciphertextHex: `0x${string}`;
  ivHex: `0x${string}`;
  commitmentHex: `0x${string}`;
};

function toHex(bytes: Uint8Array): `0x${string}` {
  return `0x${Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("")}` as `0x${string}`;
}

async function keccak256(data: Uint8Array): Promise<`0x${string}`> {
  // Use Web Crypto subtle.digest with keccak? Not available natively. Fallback to built-in in many dapp stacks via 'viem'.
  const { keccak256: viemKeccak256, toBytes, concat } = await import("viem");
  return viemKeccak256(data as any);
}

export async function encryptOrderPayload(params: {
  payload: any;
  userAddress: string;
}): Promise<EncryptedOrder> {
  const enc = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Use shared encryption key from environment
  const encryptionKeyHex = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
  if (!encryptionKeyHex) {
    throw new Error("NEXT_PUBLIC_ENCRYPTION_KEY not configured");
  }

  // Convert hex key to Uint8Array
  const keyMaterial = new Uint8Array(
    encryptionKeyHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
  );

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyMaterial,
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  );

  const plaintext = enc.encode(JSON.stringify(params.payload));
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv }, cryptoKey, plaintext)
  );

  const ivHex = toHex(iv);
  const ciphertextHex = toHex(ciphertext);

  const C = new Uint8Array(ciphertext.length + iv.length + 20);
  C.set(ciphertext, 0);
  C.set(iv, ciphertext.length);
  // include last 20 bytes of user for commitment binding
  const userBytes = new Uint8Array(20);
  const u = params.userAddress.toLowerCase().replace(/^0x/, "");
  for (let i = 0; i < 20; i++)
    userBytes[i] = parseInt(u.slice(i * 2, i * 2 + 2), 16);
  C.set(userBytes, ciphertext.length + iv.length);

  const commitmentHex = await keccak256(C);

  return { ciphertextHex, ivHex, commitmentHex };
}

export async function publishEncryptedOrderToBackend(message: {
  ciphertext: string;
  iv: string;
  commitment: string;
  ticker: string;
  side: string;
  user: string;
}): Promise<{ status: string }> {
  const base = process.env.NEXT_PUBLIC_BACKEND_URL;
  console.log("🔍 Backend URL:", base);
  if (!base) throw new Error("NEXT_PUBLIC_BACKEND_URL not set");
  const apiKey = process.env.NEXT_PUBLIC_BACKEND_API_KEY;
  console.log("📤 Publishing to HCS:", `${base}/web3/hcs/orders`, message);
  const res = await fetch(`${base}/web3/hcs/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { "x-api-key": apiKey } : {}),
    },
    body: JSON.stringify(message),
  });
  console.log("📥 HCS publish response status:", res.status);
  if (!res.ok) {
    const errorText = await res.text();
    console.error("❌ HCS publish failed:", res.status, errorText);
    throw new Error(`HCS publish failed: ${res.status} - ${errorText}`);
  }
  const result = await res.json();
  console.log("✅ HCS publish success:", result);
  return result;
}
