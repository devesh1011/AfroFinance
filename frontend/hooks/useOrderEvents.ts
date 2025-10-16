"use client";

import { useWatchContractEvent } from "wagmi";
import { useState, useCallback, useEffect } from "react";
import ordersABI from "@/abi/orders.json";
import reserveABI from "@/abi/reserve.json";

export type OrderStatus =
  | "idle"
  | "depositing"
  | "pending"
  | "processing"
  | "settled"
  | "failed";

export interface OrderEvent {
  type: "deposited" | "buyOrder" | "sellOrder" | "settlement";
  txHash: string;
  timestamp: number;
  user: string;
  amount?: bigint;
  ticker?: string;
  orderCommitment?: string;
  status: OrderStatus;
}

interface UseOrderEventsProps {
  ordersAddress: `0x${string}`;
  reserveAddress: `0x${string}`;
  userAddress?: `0x${string}`;
  enabled?: boolean;
  onDeposited?: (amount: bigint, txHash: string) => void;
  onSettlement?: (tokenAmount: bigint, txHash: string) => void;
}

export function useOrderEvents({
  ordersAddress,
  reserveAddress,
  userAddress,
  enabled = true,
  onDeposited,
  onSettlement,
}: UseOrderEventsProps) {
  const [orderHistory, setOrderHistory] = useState<OrderEvent[]>([]);
  const [currentOrderStatus, setCurrentOrderStatus] =
    useState<OrderStatus>("idle");
  const [latestTxHash, setLatestTxHash] = useState<string>("");

  // Watch for Deposited events
  useWatchContractEvent({
    address: ordersAddress,
    abi: ordersABI.abi as any,
    eventName: "Deposited",
    enabled: enabled && !!userAddress,
    onLogs(logs) {
      logs.forEach((log) => {
        const { args, transactionHash } = log as any;
        if (args?.user?.toLowerCase() === userAddress?.toLowerCase()) {
          const amount = args.amount as bigint;
          const txHash = transactionHash as string;

          console.log("📥 Deposited event detected:", {
            amount: amount.toString(),
            txHash,
          });

          // Add to order history
          setOrderHistory((prev) => [
            {
              type: "deposited",
              txHash,
              timestamp: Date.now(),
              user: args.user,
              amount,
              status: "depositing",
            },
            ...prev,
          ]);

          setLatestTxHash(txHash);
          setCurrentOrderStatus("depositing");

          // Call callback
          if (onDeposited) {
            onDeposited(amount, txHash);
          }
        }
      });
    },
  });

  // Watch for BuyOrderCreated events
  useWatchContractEvent({
    address: ordersAddress,
    abi: ordersABI.abi as any,
    eventName: "BuyOrderCreated",
    enabled: enabled && !!userAddress,
    onLogs(logs) {
      logs.forEach((log) => {
        const { args, transactionHash } = log as any;
        if (args?.user?.toLowerCase() === userAddress?.toLowerCase()) {
          const txHash = transactionHash as string;
          const ticker = args.ticker as string;
          const orderCommitment = args.orderCommitment as string;

          console.log("📝 BuyOrderCreated event detected:", {
            ticker,
            txHash,
            orderCommitment,
          });

          // Add to order history
          setOrderHistory((prev) => [
            {
              type: "buyOrder",
              txHash,
              timestamp: Date.now(),
              user: args.user,
              ticker,
              orderCommitment,
              status: "pending",
            },
            ...prev,
          ]);

          setLatestTxHash(txHash);
          setCurrentOrderStatus("pending");
        }
      });
    },
  });

  // Watch for SellOrderCreated events
  useWatchContractEvent({
    address: ordersAddress,
    abi: ordersABI.abi as any,
    eventName: "SellOrderCreated",
    enabled: enabled && !!userAddress,
    onLogs(logs) {
      logs.forEach((log) => {
        const { args, transactionHash } = log as any;
        if (args?.user?.toLowerCase() === userAddress?.toLowerCase()) {
          const txHash = transactionHash as string;
          const ticker = args.ticker as string;
          const orderCommitment = args.orderCommitment as string;

          console.log("📝 SellOrderCreated event detected:", {
            ticker,
            txHash,
            orderCommitment,
          });

          // Add to order history
          setOrderHistory((prev) => [
            {
              type: "sellOrder",
              txHash,
              timestamp: Date.now(),
              user: args.user,
              ticker,
              orderCommitment,
              status: "pending",
            },
            ...prev,
          ]);

          setLatestTxHash(txHash);
          setCurrentOrderStatus("pending");
        }
      });
    },
  });

  // Watch for SettlementAccepted events
  useWatchContractEvent({
    address: reserveAddress,
    abi: reserveABI.abi as any,
    eventName: "SettlementAccepted",
    enabled: enabled && !!userAddress,
    onLogs(logs) {
      logs.forEach((log) => {
        const { args, transactionHash } = log as any;
        if (args?.user?.toLowerCase() === userAddress?.toLowerCase()) {
          const tokenAmount = args.tokenAmount as bigint;
          const txHash = transactionHash as string;
          const ticker = args.ticker as string;
          const orderCommitment = args.orderCommitment as string;

          console.log("✅ SettlementAccepted event detected:", {
            tokenAmount: tokenAmount.toString(),
            ticker,
            txHash,
          });

          // Add to order history
          setOrderHistory((prev) => [
            {
              type: "settlement",
              txHash,
              timestamp: Date.now(),
              user: args.user,
              amount: tokenAmount,
              ticker,
              orderCommitment,
              status: "settled",
            },
            ...prev,
          ]);

          setLatestTxHash(txHash);
          setCurrentOrderStatus("settled");

          // Call callback
          if (onSettlement) {
            onSettlement(tokenAmount, txHash);
          }
        }
      });
    },
  });

  // Helper function to get HashScan link
  const getHashScanLink = useCallback((txHash: string) => {
    return `https://hashscan.io/testnet/transaction/${txHash}`;
  }, []);

  // Reset order status after a delay
  useEffect(() => {
    if (currentOrderStatus === "settled" || currentOrderStatus === "failed") {
      const timer = setTimeout(() => {
        setCurrentOrderStatus("idle");
      }, 5000); // Reset after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [currentOrderStatus]);

  return {
    orderHistory,
    currentOrderStatus,
    latestTxHash,
    getHashScanLink,
    setCurrentOrderStatus,
  };
}
