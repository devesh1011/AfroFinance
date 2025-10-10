"use client";
import StockChart from "@/components/StockChart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Shield,
  Clock,
  DollarSign,
  ArrowDownCircle,
  ArrowUpCircle,
  RefreshCcw,
} from "lucide-react";
import React, { useEffect, useState, useCallback } from "react";
import {
  useAccount,
  useConnect,
  useChainId,
  useSwitchChain,
  useReadContract,
} from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { injected } from "wagmi/connectors";
import {
  encryptOrderPayload,
  publishEncryptedOrderToBackend,
} from "@/lib/ordersPrivacy";
import { useERC20Approve } from "@/hooks/useERC20Approve";
import { useConfidentialOrdersContract } from "@/hooks/useConfidentialOrdersContract";
import { useTokenBalance } from "@/hooks/view/useTokenBalance";
import { useUSDCTokenBalance } from "@/hooks/view/useUSDCTokenBalance";
import { useOrderEvents } from "@/hooks/useOrderEvents";
import {
  OrderStatusIndicator,
  OrderHistoryItem,
} from "@/components/OrderStatusIndicator";
import erc20ABI from "@/abi/erc20.json";

const TOKENS = [
  { label: "LQD", value: "LQD" },
  // { label: "MSFT", value: "MSFT" },
  // { label: "AAPL", value: "AAPL" },
];

const CONFIDENTIAL_ORDERS_ADDRESS =
  (process.env.NEXT_PUBLIC_ORDERS_ADDRESS as `0x${string}`) ||
  "0x0000000000000000000000000000000000000000";
const USDC_ADDRESS =
  (process.env.NEXT_PUBLIC_HUSDC_ADDRESS as `0x${string}`) ||
  "0x0000000000000000000000000000000000000000";
const RWA_TOKEN_ADDRESS =
  (process.env.NEXT_PUBLIC_RWA_TOKEN_ADDRESS as `0x${string}`) ||
  "0x0000000000000000000000000000000000000000";
const RESERVE_ADDRESS =
  (process.env.NEXT_PUBLIC_RESERVE_ADDRESS as `0x${string}`) ||
  "0x0000000000000000000000000000000000000000";

// Trading log types
type LogType =
  | "ORDER_SUBMITTED"
  | "ORDER_PENDING"
  | "ORDER_FILLED"
  | "ORDER_FAILED"
  | "APPROVAL_SUCCESS"
  | "ENCRYPTION_SUCCESS";

interface TradeLogEntry {
  id: string;
  time: string;
  type: LogType;
  message: string;
  txHash?: string;
  amount?: string;
  token?: string;
}

const Page = () => {
  const [selectedToken, setSelectedToken] = useState("LQD");
  const [tokenData, setTokenData] = useState<any[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [buyUsdc, setBuyUsdc] = useState("");
  const [sellToken, setSellToken] = useState("");
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy");
  const [tradeLogs, setTradeLogs] = useState<TradeLogEntry[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [chartDataSource, setChartDataSource] = useState<"real" | "mock">(
    "real"
  );
  const [etfData, setEtfData] = useState<any>(null);

  // Mock USDC balance only
  const [mockUsdcBalance, setMockUsdcBalance] = useState(4532);

  const { isConnected, address: evmAddress } = useAccount();
  const { connect, connectors, status: connectStatus } = useConnect();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { openConnectModal } = useConnectModal();
  const userAddress = evmAddress || undefined;
  const {
    balance: tokenBalance,
    symbol: tokenSymbol,
    isLoading: balanceLoading,
    refetch: refetchTokenBalance,
  } = useTokenBalance(userAddress);
  const { approve, isPending: isApprovePending } =
    useERC20Approve(USDC_ADDRESS);
  const {
    buyAsset,
    sellAsset,
    deposit,
    isBuyAssetPending,
    isSellAssetPending,
    isDepositPending,
  } = useConfidentialOrdersContract(CONFIDENTIAL_ORDERS_ADDRESS);
  const { approve: approveLQD, isPending: isApproveLQDPending } =
    useERC20Approve(RWA_TOKEN_ADDRESS);
  const {
    balance: usdcBalance,
    isLoading: usdcLoading,
    isError: usdcError,
    refetch: refetchUsdcBalance,
  } = useUSDCTokenBalance(userAddress);

  // Debug HUSDC balance
  useEffect(() => {
    if (userAddress && !usdcLoading) {
      console.log("💰 HUSDC Balance Check:", {
        userAddress,
        USDC_ADDRESS,
        usdcBalance,
        usdcError,
        usdcLoading,
      });
    }
  }, [userAddress, usdcBalance, usdcError, usdcLoading]);

  // Check HUSDC allowance for ConfidentialOrders contract
  const { data: usdcAllowance, refetch: refetchAllowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: erc20ABI as any,
    functionName: "allowance",
    args: userAddress
      ? [userAddress as `0x${string}`, CONFIDENTIAL_ORDERS_ADDRESS]
      : undefined,
    query: {
      enabled: !!userAddress && !!USDC_ADDRESS && !!CONFIDENTIAL_ORDERS_ADDRESS,
    },
  });

  const hasApproval = usdcAllowance
    ? BigInt(usdcAllowance.toString()) > BigInt(0)
    : false;

  // Event listeners for real-time updates
  const {
    orderHistory,
    currentOrderStatus,
    latestTxHash,
    getHashScanLink,
    setCurrentOrderStatus,
  } = useOrderEvents({
    ordersAddress: CONFIDENTIAL_ORDERS_ADDRESS,
    reserveAddress: RESERVE_ADDRESS,
    userAddress: userAddress as `0x${string}` | undefined,
    enabled: isConnected,
    onDeposited: (amount, txHash) => {
      console.log("🔄 HUSDC Deposited - Refreshing balance...");
      // Auto-refresh HUSDC balance after deposit
      if (refetchUsdcBalance) {
        refetchUsdcBalance();
      }
      addTradeLog(
        "APPROVAL_SUCCESS",
        `Deposited ${amount.toString()} HUSDC to escrow`,
        { txHash }
      );
    },
    onSettlement: (tokenAmount, txHash) => {
      console.log("🔄 Settlement Complete - Refreshing LQD balance...");
      // Auto-refresh LQD balance after settlement
      if (refetchTokenBalance) {
        refetchTokenBalance();
      }
      addTradeLog(
        "ORDER_FILLED",
        `Received ${tokenAmount.toString()} LQD tokens`,
        { txHash }
      );
    },
  });

  // Test ETF data fetch
  useEffect(() => {
    async function fetchETFData() {
      try {
        console.log("Fetching ETF data for:", selectedToken);
        const response = await fetch(`/api/stocks/${selectedToken}`);
        const data = await response.json();
        console.log("ETF Response:", data);
        setEtfData(data);
      } catch (error) {
        console.error("Error fetching ETF data:", error);
      }
    }
    fetchETFData();
  }, [selectedToken]);

  // Generate mock chart data if needed
  function generateMockData(ticker: string) {
    const basePrice =
      {
        LQD: 108.5, // iShares iBoxx $ Investment Grade Corporate Bond ETF
      }[ticker] || 150.0;

    const data = [];
    const today = new Date();

    for (let i = 99; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;

      const randomFactor = 0.95 + Math.random() * 0.1; // ±5% variation
      const price = basePrice * randomFactor;
      const variance = price * 0.02; // 2% intraday variance

      const open = price + (Math.random() - 0.5) * variance;
      const close = price + (Math.random() - 0.5) * variance;
      const high = Math.max(open, close) + Math.random() * variance * 0.5;
      const low = Math.min(open, close) - Math.random() * variance * 0.5;
      const volume = Math.floor(50000000 + Math.random() * 100000000); // 50M-150M volume

      data.push({
        time: date.toISOString().split("T")[0],
        open: Math.round(open * 100) / 100,
        high: Math.round(high * 100) / 100,
        low: Math.round(low * 100) / 100,
        close: Math.round(close * 100) / 100,
        volume,
      });
    }

    return data;
  }

  // Fetch historical data for chart
  useEffect(() => {
    async function fetchChartData() {
      setLoading(true);
      try {
        // For LQD token, use mock data immediately (faster than API)
        if (selectedToken === "LQD") {
          console.log(`Using local mock data for ${selectedToken}`);
          const mockData = generateMockData(selectedToken);
          setTokenData(mockData);
          setChartDataSource("mock");
          setLoading(false);
          return;
        }

        // Try to fetch real data for other tokens
        const res = await fetch(`/api/stocks/${selectedToken}`);
        const json = await res.json();

        // Even if we get an error, we should still set some data
        if (json.error) {
          console.log(
            `❌ Chart data fetch failed, using mock data for ${selectedToken}`
          );
          const mockData = generateMockData(selectedToken);
          setTokenData(mockData);
          setChartDataSource("mock");
        } else {
          setTokenData(json.data || []);
          setChartDataSource(json.dataSource);
          console.log(
            `✅ ${json.dataSource} chart data loaded for ${selectedToken}`
          );
        }
      } catch (e) {
        console.error("Error fetching chart data:", e);
        // Fall back to mock data on any error
        console.log(
          `❌ Chart data fetch failed, using mock data for ${selectedToken}`
        );
        const mockData = generateMockData(selectedToken);
        setTokenData(mockData);
        setChartDataSource("mock");
      } finally {
        setLoading(false);
      }
    }
    fetchChartData();
  }, [selectedToken]);

  // Fetch real-time price data from Alpaca
  useEffect(() => {
    let isMounted = true;

    async function fetchPriceData() {
      try {
        const res = await fetch(`/api/marketdata?symbol=${selectedToken}`);
        const json = await res.json();

        if (!isMounted) return;

        if (json.price) {
          setCurrentPrice(json.price);
        } else {
          // If no price data, use mock price
          setCurrentPrice(108.5);
        }
      } catch (e) {
        console.error("Error fetching price data:", e);
        if (isMounted) {
          // Set fallback price on error
          setCurrentPrice(108.5);
        }
      }
    }

    fetchPriceData(); // Initial fetch
    const interval = setInterval(fetchPriceData, 5000); // Update every 5 seconds

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [selectedToken]);

  // Get latest price and market data with fallbacks
  const latestPrice =
    currentPrice ||
    (tokenData.length > 0 ? tokenData[tokenData.length - 1].close : 108.5);
  const prevPrice =
    tokenData.length > 1 ? tokenData[tokenData.length - 2].close : latestPrice;
  const priceChange = latestPrice - prevPrice;
  const priceChangePercent =
    prevPrice > 0 ? (priceChange / prevPrice) * 100 : 0;

  // Calculate fees and estimates
  const tradingFee = 0.0025; // 0.25% fee
  const estimatedTokens =
    buyUsdc && latestPrice
      ? (parseFloat(buyUsdc) / latestPrice).toFixed(4)
      : "";
  const estimatedUsdc =
    sellToken && latestPrice
      ? (parseFloat(sellToken) * latestPrice).toFixed(2)
      : "";

  // Fee calculations
  const buyFeeUsdc = buyUsdc
    ? (parseFloat(buyUsdc) * tradingFee).toFixed(2)
    : "";
  const sellFeeUsdc = estimatedUsdc
    ? (parseFloat(estimatedUsdc) * tradingFee).toFixed(2)
    : "";
  const netReceiveTokens = estimatedTokens
    ? (parseFloat(estimatedTokens) * (1 - tradingFee)).toFixed(4)
    : "";
  const netReceiveUsdc = estimatedUsdc
    ? (parseFloat(estimatedUsdc) * (1 - tradingFee)).toFixed(2)
    : "";

  // Log management functions
  const logCounterRef = React.useRef(0);

  const addTradeLog = useCallback(
    (type: LogType, message: string, extra?: Partial<TradeLogEntry>) => {
      logCounterRef.current += 1;
      const newLog: TradeLogEntry = {
        id: `${Date.now()}-${logCounterRef.current}`, // Add counter to ensure uniqueness
        time: new Date().toLocaleTimeString(),
        type,
        message,
        ...extra,
      };
      setTradeLogs((prev) => [newLog, ...prev].slice(0, 50)); // Keep last 50 logs
      console.log(`[TradeLog] ${type}: ${message}`, extra);
    },
    []
  );

  const fetchTradeLogs = useCallback(async () => {
    setLogsLoading(true);
    try {
      // Simulate fetching logs from a service
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Start with empty logs - only show real trades
      setTradeLogs([]);
    } catch (error) {
      console.error("[TradeLogs] Error fetching logs:", error);
    } finally {
      setLogsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTradeLogs();
  }, [fetchTradeLogs]);

  // Handle standalone HUSDC approval
  const handleApproveHUSDC = async () => {
    if (!isConnected) {
      if (openConnectModal) openConnectModal();
      return;
    }
    if (chainId !== 296) {
      try {
        await switchChainAsync({ chainId: 296 });
      } catch {
        addTradeLog("ORDER_FAILED", "Please switch to Hedera Testnet (296)");
        return;
      }
    }

    try {
      addTradeLog("ORDER_PENDING", "Approving HUSDC for trading...");
      // Approve maximum amount (or a very large amount)
      const maxAmount = BigInt(
        "115792089237316195423570985008687907853269984665640564039457584007913129639935"
      ); // Max uint256
      await approve(CONFIDENTIAL_ORDERS_ADDRESS, maxAmount);
      addTradeLog(
        "APPROVAL_SUCCESS",
        "✅ HUSDC approved successfully! You can now trade."
      );

      // Refresh allowance
      setTimeout(() => {
        refetchAllowance();
      }, 2000);
    } catch (error) {
      console.error("Approval error:", error);
      addTradeLog("ORDER_FAILED", "Failed to approve HUSDC. Please try again.");
    }
  };

  const handleBuy = async () => {
    if (!isConnected) {
      if (openConnectModal) openConnectModal();
      addTradeLog(
        "ORDER_FAILED",
        "Connect an EVM wallet on Hedera Testnet (296) first."
      );
      return;
    }
    if (chainId !== 296) {
      try {
        await switchChainAsync({ chainId: 296 });
      } catch {
        addTradeLog(
          "ORDER_FAILED",
          "Please switch your wallet to Hedera Testnet (296). "
        );
        return;
      }
    }
    if (!userAddress || !buyUsdc) return;
    const amount = BigInt(Math.floor(Number(buyUsdc) * 1e6)); // USDC has 6 decimals
    const usdcAmount = parseFloat(buyUsdc);
    const estimatedTokenAmount = latestPrice > 0 ? usdcAmount / latestPrice : 0;

    // Step 1: Initialize order
    addTradeLog(
      "ORDER_PENDING",
      `Preparing buy order: ***** USDC → ${selectedToken}`,
      {
        amount: "*****",
        token: selectedToken,
      }
    );

    const debugCtx = {
      chainId,
      evmAddress,
      orders: CONFIDENTIAL_ORDERS_ADDRESS,
      husdc: USDC_ADDRESS,
      rwa: RWA_TOKEN_ADDRESS,
      ticker: selectedToken,
      amount: amount.toString(),
    };
    const logErr = (phase: string, err: unknown) => {
      // eslint-disable-next-line no-console
      console.error("[BUY_DEBUG]", {
        phase,
        ...debugCtx,
        error: String(err),
        err,
      });
    };

    try {
      // Step 2: USDC approval (HUSDC on Hedera EVM) - skip if already approved
      if (!hasApproval) {
        addTradeLog("ORDER_PENDING", "Approving HUSDC for deposit...");
        const approveTx = await approve(
          CONFIDENTIAL_ORDERS_ADDRESS,
          amount
        ).catch((e) => {
          logErr("approve", e);
          throw e;
        });
        addTradeLog("APPROVAL_SUCCESS", "HUSDC approved successfully");
        // Wait for transaction to propagate
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } else {
        addTradeLog("ORDER_PENDING", "✅ Using existing HUSDC approval");
      }

      // Step 3: Deposit HUSDC to escrow
      addTradeLog(
        "ORDER_PENDING",
        `Depositing ${usdcAmount.toFixed(2)} HUSDC to escrow...`
      );
      try {
        await deposit(amount);
        addTradeLog(
          "ORDER_PENDING",
          `HUSDC deposited: -${usdcAmount.toFixed(2)} USDC`
        );
      } catch (e) {
        logErr("deposit", e);
        throw e;
      }

      // Step 4: Client-side AES-GCM encryption and commitment
      addTradeLog("ORDER_PENDING", "Encrypting order details...");
      const orderPayload = {
        side: "BUY",
        ticker: selectedToken,
        amount: amount.toString(),
        token: RWA_TOKEN_ADDRESS,
        ts: Math.floor(Date.now() / 1000),
      };
      const { ciphertextHex, ivHex, commitmentHex } = await encryptOrderPayload(
        {
          payload: orderPayload,
          userAddress: userAddress as string,
        }
      ).catch((e) => {
        logErr("encrypt", e);
        throw e;
      });

      addTradeLog("ENCRYPTION_SUCCESS", "Order details encrypted and secured");

      // Step 5: Publish encrypted order to HCS via backend (with commitment)
      addTradeLog("ORDER_PENDING", "Publishing encrypted order to HCS...");
      await publishEncryptedOrderToBackend({
        ciphertext: ciphertextHex,
        iv: ivHex,
        commitment: commitmentHex,
        ticker: selectedToken,
        side: "BUY",
        user: userAddress,
      }).catch((e) => {
        logErr("hcs_publish", e);
        throw e;
      });
      addTradeLog(
        "ORDER_PENDING",
        `Encrypted order published to HCS for ${selectedToken}`
      );

      // Step 6: Submit commitment on-chain
      addTradeLog(
        "ORDER_SUBMITTED",
        `Submitting order commitment to blockchain...`
      );
      try {
        // New simplified buyAsset() - no subscriptionId or asset parameter needed
        await buyAsset(
          selectedToken, // ticker
          RWA_TOKEN_ADDRESS as `0x${string}`, // token
          commitmentHex as `0x${string}` // orderCommitment
        );
        addTradeLog(
          "ORDER_SUBMITTED",
          `Order commitment submitted: USDC → ${selectedToken}`
        );
      } catch (e) {
        logErr("buyAsset", e);
        throw e;
      }

      // Note: Remaining steps (validation, execution, minting) will be logged by backend
      // when it processes the HCS message and calls Reserve.settle()
      // Frontend can listen for SettlementAccepted events to show completion

      // Clear input after submission
      setBuyUsdc("");
    } catch (err) {
      logErr("catch_all", err);
      addTradeLog(
        "ORDER_FAILED",
        `Order failed: ${err instanceof Error ? err.message : "Unknown error"}`
      );
      console.error("Error in handleBuy:", err);
    }
  };
  const handleSell = () => {
    if (!sellToken) return;

    addTradeLog(
      "ORDER_SUBMITTED",
      `Sell order submitted: ***** ${selectedToken} → USDC`,
      {
        amount: "*****",
        token: selectedToken,
      }
    );

    // Simulate order processing
    setTimeout(() => {
      addTradeLog(
        "ORDER_FILLED",
        `Sell order filled: ***** ${selectedToken} → ***** USDC`,
        {
          amount: "*****",
          token: selectedToken,
        }
      );
    }, 2000);
  };

  // LogEntry component following the pattern from LogBar
  const LogEntry = ({
    time,
    type,
    message,
  }: {
    time: string;
    type: LogType;
    message: string;
  }) => {
    const getLogColor = (logType: LogType) => {
      switch (logType) {
        case "ORDER_FILLED":
          return "text-green-600 bg-green-50 border-green-200";
        case "ORDER_SUBMITTED":
          return "text-slate-600 bg-slate-50 border-slate-200";
        case "ORDER_PENDING":
          return "text-orange-600 bg-orange-50 border-orange-200";
        case "ORDER_FAILED":
          return "text-red-600 bg-red-50 border-red-200";
        case "APPROVAL_SUCCESS":
          return "text-slate-600 bg-slate-50 border-slate-200";
        case "ENCRYPTION_SUCCESS":
          return "text-purple-600 bg-purple-50 border-purple-200";
        default:
          return "text-slate-600 bg-slate-50 border-slate-200";
      }
    };

    const getLogIcon = (logType: LogType) => {
      switch (logType) {
        case "ORDER_FILLED":
          return "✅";
        case "ORDER_SUBMITTED":
          return "📤";
        case "ORDER_PENDING":
          return "⏳";
        case "ORDER_FAILED":
          return "❌";
        case "APPROVAL_SUCCESS":
          return "🔐";
        case "ENCRYPTION_SUCCESS":
          return "🔒";
        default:
          return "📝";
      }
    };

    return (
      <div
        className={`p-3 rounded-lg border transition-colors hover:shadow-sm ${getLogColor(type)}`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-2 flex-1">
            <span className="text-sm">{getLogIcon(type)}</span>
            <div>
              <p className="text-sm font-medium leading-tight">{message}</p>
              <p className="text-xs opacity-70 mt-1">{time}</p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs shrink-0 ml-2">
            {type.replace("_", " ")}
          </Badge>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-2 md:px-0">
      {/* Token Selector */}
      <div className="flex justify-center gap-4 mt-4">
        {TOKENS.map((token) => (
          <Button
            key={token.value}
            variant={selectedToken === token.value ? "default" : "outline"}
            onClick={() => setSelectedToken(token.value)}
            className="min-w-[80px]"
          >
            {token.label}
          </Button>
        ))}
      </div>

      {/* Chart Section */}
      <div className="mb-8">
        {loading ? (
          <div className="h-[400px] flex items-center justify-center bg-slate-50 rounded-xl">
            <div className="text-center">
              <RefreshCcw className="w-8 h-8 animate-spin text-slate-400 mx-auto mb-2" />
              <p className="text-slate-600">Loading chart data...</p>
            </div>
          </div>
        ) : (
          <StockChart data={tokenData} ticker={selectedToken} />
        )}
      </div>
      {/* Trading Section */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-8">
        {/* Main Trading Interface */}
        <div className="lg:col-span-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/30">
            <div className="pb-4">
              {/* Buy/Sell Toggle */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {tradeType === "buy" ? (
                    <ArrowDownCircle className="text-slate-600 w-6 h-6" />
                  ) : (
                    <ArrowUpCircle className="text-slate-600 w-6 h-6" />
                  )}
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      {tradeType === "buy" ? "Buy" : "Sell"} {selectedToken}
                    </h2>
                    <p className="text-sm text-slate-600">
                      {tradeType === "buy"
                        ? `Deposit USDC to receive ${selectedToken}`
                        : `Sell ${selectedToken} for USDC`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500 flex items-center justify-end gap-1">
                    {tradeType === "buy"
                      ? "USDC Balance"
                      : `${selectedToken} Balance`}
                    <RefreshCcw
                      className="w-3 h-3 cursor-pointer hover:text-slate-700 transition-colors"
                      onClick={() => {
                        if (tradeType === "buy") {
                          refetchUsdcBalance?.();
                        } else {
                          refetchTokenBalance?.();
                        }
                      }}
                    />
                  </div>
                  <div
                    className={`font-bold text-base ${
                      tradeType === "buy" ? "text-slate-700" : "text-slate-700"
                    }`}
                  >
                    {tradeType === "buy"
                      ? usdcLoading
                        ? "Loading..."
                        : usdcError || usdcBalance === undefined
                          ? "0.00 USDC"
                          : `${usdcBalance.toFixed(2)} USDC`
                      : balanceLoading
                        ? "Loading..."
                        : `${tokenBalance.toFixed(3)} ${selectedToken}`}
                  </div>
                  {/* Show secondary balance */}
                  <div className="text-xs text-slate-400 mt-1 flex items-center justify-end gap-1">
                    {tradeType === "buy"
                      ? balanceLoading
                        ? "Loading..."
                        : `${tokenBalance.toFixed(3)} ${selectedToken}`
                      : usdcLoading
                        ? "Loading..."
                        : usdcError || usdcBalance === undefined
                          ? "0.00 USDC"
                          : `${usdcBalance.toFixed(2)} USDC`}
                    <RefreshCcw
                      className="w-2.5 h-2.5 cursor-pointer hover:text-slate-600 transition-colors opacity-50"
                      onClick={() => {
                        if (tradeType === "buy") {
                          refetchTokenBalance?.();
                        } else {
                          refetchUsdcBalance?.();
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Toggle Buttons */}
              <div className="flex bg-slate-100 rounded-lg p-1 mb-6 relative overflow-hidden">
                {/* Sliding button background */}
                <div
                  className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-md shadow-sm transition-transform duration-500 ease-in-out ${
                    tradeType === "sell"
                      ? "translate-x-[calc(100%+4px)]"
                      : "translate-x-0"
                  }`}
                />
                <button
                  onClick={() => setTradeType("buy")}
                  className="flex-1 relative flex items-center justify-center gap-2 py-2 px-3 rounded-md font-medium text-sm transition-colors duration-500 ease-in-out z-10"
                  style={{
                    color: tradeType === "buy" ? "#0f172a" : "#475569",
                  }}
                >
                  <ArrowDownCircle className="w-4 h-4" />
                  Buy
                </button>
                <button
                  onClick={() => setTradeType("sell")}
                  className="flex-1 relative flex items-center justify-center gap-2 py-2 px-3 rounded-md font-medium text-sm transition-colors duration-500 ease-in-out z-10"
                  style={{
                    color: tradeType === "sell" ? "#0f172a" : "#475569",
                  }}
                >
                  <ArrowUpCircle className="w-4 h-4" />
                  Sell
                </button>
              </div>
            </div>

            <div>
              {/* Market Info Bar */}
              <div className="mb-6 p-4 bg-gradient-to-br from-slate-50 to-transparent rounded-xl border border-slate-200 hover:border-slate-400 transition-all duration-200 group/market">
                <div className="absolute left-0 inset-y-0 h-4 group-hover/market:h-5 w-1 rounded-tr-full rounded-br-full bg-slate-300 group-hover/market:bg-slate-400 transition-all duration-200 origin-center" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-xs text-slate-500">Current Price</p>
                      <p className="font-bold text-lg text-slate-900">
                        ${latestPrice.toFixed(2)}
                      </p>
                    </div>
                    <div
                      className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        priceChangePercent >= 0
                          ? "bg-slate-100 text-slate-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      <TrendingUp
                        className={`w-3 h-3 ${priceChangePercent < 0 ? "rotate-180" : ""}`}
                      />
                      {priceChangePercent >= 0 ? "+" : ""}
                      {priceChangePercent.toFixed(2)}%
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">24h Change</p>
                    <p
                      className={`font-semibold ${priceChangePercent >= 0 ? "text-slate-600" : "text-red-600"}`}
                    >
                      ${priceChange >= 0 ? "+" : ""}
                      {priceChange.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {tradeType === "buy" ? (
                <>
                  <div className="mb-4">
                    <label className="block text-sm text-slate-600 mb-2">
                      USDC Amount
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={buyUsdc}
                      onChange={(e) => setBuyUsdc(e.target.value)}
                      placeholder="Enter USDC amount"
                      className="border border-slate-200 focus:border-slate-400 rounded-lg px-4 py-3 w-full bg-white shadow-sm focus:outline-none transition text-lg"
                    />
                  </div>

                  {buyUsdc && latestPrice > 0 && (
                    <div className="mb-4 space-y-3">
                      {/* Estimation Summary */}
                      <div className="p-4 rounded-lg bg-gradient-to-br from-slate-50 to-transparent border border-slate-200 hover:border-slate-400 transition-all">
                        <div className="text-sm text-slate-700 mb-3 font-medium">
                          Transaction Summary
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">You pay:</span>
                            <span className="font-semibold text-slate-900">
                              {buyUsdc} USDC
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">
                              Trading fee (0.25%):
                            </span>
                            <span className="font-semibold text-orange-600">
                              -{buyFeeUsdc} USDC
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">
                              You receive (est.):
                            </span>
                            <span className="font-bold text-slate-700">
                              {netReceiveTokens} {selectedToken}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Rate:</span>
                            <span className="font-semibold text-slate-900">
                              1 {selectedToken} = ${latestPrice.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Risk & Slippage Info */}
                      <div className="p-3 rounded-lg bg-orange-50 border border-orange-200">
                        <div className="text-xs text-orange-700 space-y-1">
                          <div className="flex justify-between">
                            <span>Max slippage (1%):</span>
                            <span className="font-semibold">
                              {(parseFloat(netReceiveTokens) * 0.99).toFixed(4)}{" "}
                              {selectedToken}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Network fee:</span>
                            <span className="font-semibold">
                              ~$2.50 (estimated)
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Settlement time:</span>
                            <span className="font-semibold">~15 seconds</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    className="w-full mt-4 font-semibold text-lg py-3 bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={handleBuy}
                    disabled={!buyUsdc || isApprovePending || isBuyAssetPending}
                  >
                    {isApprovePending || isBuyAssetPending
                      ? "Processing..."
                      : `Buy ${selectedToken}`}
                  </Button>
                </>
              ) : (
                <>
                  <div className="mb-4">
                    <label className="block text-sm text-slate-600 mb-2">
                      {selectedToken} Amount
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={sellToken}
                      onChange={(e) => setSellToken(e.target.value)}
                      placeholder={`Enter ${selectedToken} amount`}
                      className="border border-slate-200 focus:border-slate-400 rounded-lg px-4 py-3 w-full bg-white shadow-sm focus:outline-none transition text-lg"
                    />
                  </div>

                  {sellToken && latestPrice > 0 && (
                    <div className="mb-4 space-y-3">
                      {/* Estimation Summary */}
                      <div className="p-4 rounded-lg bg-gradient-to-br from-slate-50 to-transparent border border-slate-200 hover:border-slate-400 transition-all">
                        <div className="text-sm text-slate-700 mb-3 font-medium">
                          Transaction Summary
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">You sell:</span>
                            <span className="font-semibold text-slate-900">
                              {sellToken} {selectedToken}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">
                              Gross amount:
                            </span>
                            <span className="font-semibold text-slate-900">
                              {estimatedUsdc} USDC
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">
                              Trading fee (0.25%):
                            </span>
                            <span className="font-semibold text-orange-600">
                              -{sellFeeUsdc} USDC
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">
                              You receive (net):
                            </span>
                            <span className="font-bold text-slate-700">
                              {netReceiveUsdc} USDC
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Rate:</span>
                            <span className="font-semibold text-slate-900">
                              1 {selectedToken} = ${latestPrice.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Risk & Slippage Info */}
                      <div className="p-3 rounded-lg bg-orange-50 border border-orange-200">
                        <div className="text-xs text-orange-700 space-y-1">
                          <div className="flex justify-between">
                            <span>Min slippage (1%):</span>
                            <span className="font-semibold">
                              {(parseFloat(netReceiveUsdc) * 0.99).toFixed(2)}{" "}
                              USDC
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Network fee:</span>
                            <span className="font-semibold">
                              ~$2.50 (estimated)
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Settlement time:</span>
                            <span className="font-semibold">~15 seconds</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    className="w-full mt-4 font-semibold text-lg py-3 bg-red-600 hover:bg-red-700 text-white"
                    onClick={handleSell}
                    disabled={
                      !sellToken || isSellAssetPending || isApproveLQDPending
                    }
                  >
                    {isSellAssetPending || isApproveLQDPending
                      ? "Processing..."
                      : `Sell ${selectedToken}`}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Trading Info Sidebar */}
        <div className="space-y-6 lg:col-span-3">
          {/* Order Status Indicator */}
          {currentOrderStatus !== "idle" && (
            <OrderStatusIndicator
              status={currentOrderStatus}
              txHash={latestTxHash}
              getHashScanLink={getHashScanLink}
            />
          )}

          {/* Order History */}
          {orderHistory.length > 0 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/30">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-1">
                    Order History
                    <Badge variant="secondary" className="text-xs">
                      {orderHistory.length}
                    </Badge>
                  </h2>
                  <p className="text-slate-600">
                    Real-time order tracking and status
                  </p>
                </div>
              </div>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {orderHistory.slice(0, 10).map((event, index) => (
                  <OrderHistoryItem
                    key={`${event.txHash}-${index}`}
                    event={event}
                    getHashScanLink={getHashScanLink}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Recent Trades */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/30">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-1">
                  Recent Trades
                  <Shield className="w-4 h-4 text-purple-500" />
                </h2>
                <p className="text-slate-600">
                  Your confidential trading history
                </p>
              </div>
              <button
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-all flex items-center gap-2 text-sm"
                onClick={() => {
                  setLogsLoading(true);
                  fetchTradeLogs();
                }}
              >
                <RefreshCcw
                  className={`w-4 h-4 ${logsLoading ? "animate-spin" : ""}`}
                />
                {!logsLoading && "Refresh"}
              </button>
            </div>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {tradeLogs.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No transactions yet</p>
                  <p className="text-xs">Start trading to see logs here</p>
                </div>
              ) : (
                tradeLogs.map((log) => {
                  // Extract pair info from message for better display
                  const getPairFromMessage = (message: string) => {
                    if (message.includes("USDC → "))
                      return (
                        message.match(/USDC → (\w+)/)?.[0] || "USDC → Token"
                      );
                    if (message.includes("→ USDC"))
                      return (
                        message.match(/(\w+) → USDC/)?.[0] || "Token → USDC"
                      );
                    return message;
                  };

                  return (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-50 to-transparent rounded-xl border border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-all duration-200"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {getPairFromMessage(log.message)}
                        </p>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <span className="font-mono text-purple-600">
                            *****
                          </span>
                          <span>encrypted amount</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant="secondary"
                          className={`text-xs ${
                            log.type === "ORDER_FILLED"
                              ? "bg-green-100 text-green-700"
                              : log.type === "ORDER_SUBMITTED"
                                ? "bg-slate-100 text-slate-700"
                                : log.type === "ORDER_PENDING"
                                  ? "bg-orange-100 text-orange-700"
                                  : log.type === "ORDER_FAILED"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {log.type === "ORDER_FILLED"
                            ? "Completed"
                            : log.type === "ORDER_SUBMITTED"
                              ? "Submitted"
                              : log.type === "ORDER_PENDING"
                                ? "Pending"
                                : log.type === "ORDER_FAILED"
                                  ? "Failed"
                                  : log.type.replace("_", " ")}
                        </Badge>
                        <p className="text-xs text-slate-500 mt-1">
                          {log.time}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
