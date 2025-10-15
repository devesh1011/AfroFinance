import { useAccount, useReadContract, useWriteContract } from "wagmi";

const abi = [
  {
    inputs: [
      { internalType: "string", name: "ticker", type: "string" },
      { internalType: "address", name: "token", type: "address" },
      { internalType: "bytes32", name: "orderCommitment", type: "bytes32" },
    ],
    name: "buyAsset",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "string", name: "ticker", type: "string" },
      { internalType: "address", name: "token", type: "address" },
      { internalType: "bytes32", name: "orderCommitment", type: "bytes32" },
    ],
    name: "sellAsset",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    name: "pendingBuyOrders",
    outputs: [
      { internalType: "address", name: "user", type: "address" },
      { internalType: "string", name: "ticker", type: "string" },
      { internalType: "address", name: "token", type: "address" },
      { internalType: "bytes32", name: "orderCommitment", type: "bytes32" },
      { internalType: "address", name: "orderAddr", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    name: "pendingSellOrders",
    outputs: [
      { internalType: "address", name: "user", type: "address" },
      { internalType: "string", name: "ticker", type: "string" },
      { internalType: "address", name: "token", type: "address" },
      { internalType: "bytes32", name: "orderCommitment", type: "bytes32" },
      { internalType: "address", name: "orderAddr", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
    name: "deposit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "getDeposit",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "agent",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "usdcToken",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    name: "usedCommitments",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      {
        indexed: false,
        internalType: "string",
        name: "ticker",
        type: "string",
      },
      {
        indexed: false,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "orderCommitment",
        type: "bytes32",
      },
    ],
    name: "BuyOrderCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "Deposited",
    type: "event",
  },
];

export function useConfidentialOrdersContract(ordersAddress: `0x${string}`) {
  const { address } = useAccount();

  // Write functions
  const {
    writeContractAsync: buyAssetAsync,
    isPending: isBuyAssetPending,
    error: buyAssetError,
  } = useWriteContract();
  const {
    writeContractAsync: sellAssetAsync,
    isPending: isSellAssetPending,
    error: sellAssetError,
  } = useWriteContract();
  const {
    writeContractAsync: depositAsync,
    isPending: isDepositPending,
    error: depositError,
  } = useWriteContract();

  // Read functions
  const readDeposit = (user: `0x${string}`) =>
    useReadContract({
      address: ordersAddress,
      abi: abi as any,
      functionName: "getDeposit",
      args: [user],
    });

  const readUsedCommitment = (commitment: `0x${string}`) =>
    useReadContract({
      address: ordersAddress,
      abi: abi as any,
      functionName: "usedCommitments",
      args: [commitment],
    });

  // Function calls
  // buyAsset with order commitment (simplified for Hedera - no oracle)
  const executeBuyAsset = async (
    ticker: string,
    token: `0x${string}`,
    orderCommitment: `0x${string}`
  ) => {
    return await buyAssetAsync({
      address: ordersAddress,
      abi: abi as any,
      functionName: "buyAsset",
      args: [ticker, token, orderCommitment],
    });
  };

  // sellAsset with order commitment
  const executeSellAsset = async (
    asset: string,
    ticker: string,
    token: `0x${string}`,
    orderCommitment: `0x${string}`,
    subscriptionId: bigint,
    orderAddr: `0x${string}`
  ) => {
    return await sellAssetAsync({
      address: ordersAddress,
      abi: abi as any,
      functionName: "sellAsset",
      args: [asset, ticker, token, orderCommitment, subscriptionId, orderAddr],
    });
  };

  // Deposit HUSDC to escrow
  const executeDeposit = async (amount: bigint) => {
    return await depositAsync({
      address: ordersAddress,
      abi: abi as any,
      functionName: "deposit",
      args: [amount],
    });
  };

  return {
    address,
    // Write functions with their states
    buyAsset: executeBuyAsset,
    sellAsset: executeSellAsset,
    deposit: executeDeposit,
    isBuyAssetPending,
    isSellAssetPending,
    isDepositPending,
    buyAssetError,
    sellAssetError,
    depositError,
    // Read functions
    readDeposit,
    readUsedCommitment,
  };
}
