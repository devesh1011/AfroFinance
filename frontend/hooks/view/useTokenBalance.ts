import { useEffect, useState } from "react";
import { ethers } from "ethers";
import erc20ABIJson from "@/abi/erc20.json";

// Extract ABI from JSON (handles both { abi: [...] } and direct array formats)
const erc20ABI = (erc20ABIJson as any).abi || erc20ABIJson;

// LQD Token Address (from NEXT_PUBLIC_RWA_TOKEN_ADDRESS)
const TOKEN_ADDRESS =
  (process.env.NEXT_PUBLIC_RWA_TOKEN_ADDRESS as `0x${string}`) ||
  "0x2fD841C454EeEd0a4E2a3474dFCadafEe52E8342";

// Hedera RPC URL
const RPC_URL =
  process.env.NEXT_PUBLIC_HEDERA_RPC || "https://testnet.hashio.io/api";

export function useTokenBalance(address: string | undefined) {
  const [balance, setBalance] = useState<number>(0);
  const [symbol, setSymbol] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch balance when address changes
  useEffect(() => {
    if (!address || !TOKEN_ADDRESS || TOKEN_ADDRESS === "0x0000000000000000000000000000000000000000") {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const loadBalance = async () => {
      try {
        setIsLoading(true);
        setIsError(false);
        setError(null);

        // Create provider
        const provider = new ethers.JsonRpcProvider(RPC_URL);

        // Create contract instance
        const contract = new ethers.Contract(TOKEN_ADDRESS, erc20ABI, provider);

        // Fetch all data in parallel
        const [balanceRaw, decimals, symbolValue] = await Promise.all([
          contract.balanceOf(address),
          contract.decimals(),
          contract.symbol(),
        ]);

        if (!isMounted) return;

        // Convert balance using decimals
        const decimalsNumber = Number(decimals);
        const balanceNumber = Number(balanceRaw);
        const formattedBalance = balanceNumber / 10 ** decimalsNumber;

        console.log("✅ LQD Token Balance (ethers.js):", {
          tokenAddress: TOKEN_ADDRESS,
          userAddress: address,
          balanceRaw: balanceRaw.toString(),
          decimals: decimalsNumber,
          symbol: symbolValue,
          formattedBalance,
        });

        setBalance(formattedBalance);
        setSymbol(symbolValue);
        setIsLoading(false);
      } catch (err) {
        if (!isMounted) return;
        console.error("❌ Error fetching LQD balance:", err);
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(errorMessage);
        setIsError(true);
        setIsLoading(false);
        setBalance(0);
      }
    };

    loadBalance();

    return () => {
      isMounted = false;
    };
  }, [address, TOKEN_ADDRESS]);

  // Poll for balance updates every 5 seconds
  useEffect(() => {
    if (!address || !TOKEN_ADDRESS || TOKEN_ADDRESS === "0x0000000000000000000000000000000000000000") {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const contract = new ethers.Contract(TOKEN_ADDRESS, erc20ABI, provider);
        const [balanceRaw, decimals] = await Promise.all([
          contract.balanceOf(address),
          contract.decimals(),
        ]);
        const decimalsNumber = Number(decimals);
        const balanceNumber = Number(balanceRaw);
        const formattedBalance = balanceNumber / 10 ** decimalsNumber;
        setBalance(formattedBalance);
      } catch (err) {
        console.error("❌ Error polling LQD balance:", err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [address, TOKEN_ADDRESS]);

  const refetch = () => {
    if (!address || !TOKEN_ADDRESS || TOKEN_ADDRESS === "0x0000000000000000000000000000000000000000") {
      return;
    }
    
    (async () => {
      try {
        setIsLoading(true);
        setIsError(false);
        setError(null);

        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const contract = new ethers.Contract(TOKEN_ADDRESS, erc20ABI, provider);

        const [balanceRaw, decimals, symbolValue] = await Promise.all([
          contract.balanceOf(address),
          contract.decimals(),
          contract.symbol(),
        ]);

        const decimalsNumber = Number(decimals);
        const balanceNumber = Number(balanceRaw);
        const formattedBalance = balanceNumber / 10 ** decimalsNumber;

        setBalance(formattedBalance);
        setSymbol(symbolValue);
        setIsLoading(false);
      } catch (err) {
        console.error("❌ Error refetching LQD balance:", err);
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(errorMessage);
        setIsError(true);
        setIsLoading(false);
      }
    })();
  };

  return {
    balance,
    symbol,
    isError,
    isLoading,
    refetch,
  };
}
