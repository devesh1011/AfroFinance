import { useReadContract } from "wagmi";
import erc20ABIJson from "@/abi/erc20.json";

const erc20ABI = (erc20ABIJson as any).abi || erc20ABIJson;

const USDC_ADDRESS =
  (process.env.NEXT_PUBLIC_HUSDC_ADDRESS as `0x${string}`) ||
  ("0x0000000000000000000000000000000000000000" as `0x${string}`);

export function useUSDCTokenBalance(address: string | undefined) {
  // Get decimals (doesn't need address)
  const { data: decimals, error: decimalsError } = useReadContract({
    address: USDC_ADDRESS,
    abi: erc20ABI,
    functionName: "decimals",
  });

  // Get balance
  const {
    data: balance,
    isError,
    isLoading,
    refetch,
    error: balanceError,
  } = useReadContract({
    address: USDC_ADDRESS,
    abi: erc20ABI,
    functionName: "balanceOf",
    args: address ? [address as `0x${string}`] : undefined,
    query: {
      enabled:
        !!address &&
        !!USDC_ADDRESS &&
        USDC_ADDRESS !== "0x0000000000000000000000000000000000000000",
    },
  });

  // Get token symbol (doesn't need address)
  const { data: symbol, error: symbolError } = useReadContract({
    address: USDC_ADDRESS,
    abi: erc20ABI,
    functionName: "symbol",
  });

  // Calculate final balance
  const finalBalance =
    balance && decimals ? Number(balance) / 10 ** Number(decimals) : 0;

  // Helper to extract error messages
  const extractError = (err: unknown): string | null => {
    if (!err) return null;

    // Handle Error instances
    if (err instanceof Error) {
      return err.message || err.name || null;
    }

    // Handle objects with message/name properties
    if (typeof err === "object" && err !== null) {
      const obj = err as Record<string, unknown>;

      // Try message first
      if (
        "message" in obj &&
        typeof obj.message === "string" &&
        obj.message.trim()
      ) {
        return obj.message;
      }

      // Try shortMessage (common in viem/wagmi errors)
      if (
        "shortMessage" in obj &&
        typeof obj.shortMessage === "string" &&
        obj.shortMessage.trim()
      ) {
        return obj.shortMessage;
      }

      // Try name
      if ("name" in obj && typeof obj.name === "string" && obj.name.trim()) {
        return obj.name;
      }

      // Try details
      if (
        "details" in obj &&
        typeof obj.details === "string" &&
        obj.details.trim()
      ) {
        return obj.details;
      }

      // As last resort, try to stringify if it's not just [object Object]
      try {
        const str = JSON.stringify(err);
        if (str && str !== "{}" && str !== "{}") return str;
      } catch {
        // If JSON.stringify fails, try String()
        const str = String(err);
        if (str && str !== "[object Object]") return str;
      }
    }

    return null;
  };

  // Debug logging (only in development and only for meaningful errors)
  if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    // Only log once when hook first loads with missing config
    if (!address && !isLoading) {
      // Silent - no need to warn on every render
    }
    if (
      (!USDC_ADDRESS ||
        USDC_ADDRESS === "0x0000000000000000000000000000000000000000") &&
      !isLoading
    ) {
      console.warn("[useUSDCTokenBalance] HUSDC_ADDRESS not set in .env.local");
    }

    // Only log errors with actual meaningful messages
    // Skip if errors are just empty objects from wagmi
    const balanceErrMsg = extractError(balanceError);
    const decimalsErrMsg = extractError(decimalsError);
    const symbolErrMsg = extractError(symbolError);

    const errors: Array<{ type: string; message: string }> = [];

    if (balanceErrMsg && balanceErrMsg.trim()) {
      errors.push({ type: "balanceError", message: balanceErrMsg });
    }
    if (decimalsErrMsg && decimalsErrMsg.trim()) {
      errors.push({ type: "decimalsError", message: decimalsErrMsg });
    }
    if (symbolErrMsg && symbolErrMsg.trim()) {
      errors.push({ type: "symbolError", message: symbolErrMsg });
    }

    // Only log if we successfully extracted error messages (not empty objects)
    if (errors.length > 0) {
      console.error("[useUSDCTokenBalance] Contract read errors:", errors);
    }

    // Success logging (only once when data loads successfully)
    if (!isLoading && errors.length === 0 && address && balance !== undefined) {
      console.log("[useUSDCTokenBalance] ✅ Loaded:", {
        balance: finalBalance,
        symbol,
        decimals: Number(decimals),
      });
    }
  }

  // Only mark as error if there are actual errors and address is provided
  // Don't mark as error if queries are just disabled due to missing address
  const hasRealErrors =
    address &&
    ((!!balanceError && extractError(balanceError)) ||
      (!!decimalsError && extractError(decimalsError)) ||
      (!!symbolError && extractError(symbolError)));

  return {
    balance: finalBalance,
    symbol: symbol as string | undefined,
    isError: hasRealErrors || false, // Only true if address exists and there's a real error
    isLoading,
    refetch,
  };
}
