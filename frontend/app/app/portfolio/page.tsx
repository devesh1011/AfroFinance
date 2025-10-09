"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  Plus,
  RefreshCw,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import { useTokenBalance } from "@/hooks/view/useTokenBalance";
import { useMarketData } from "@/hooks/useMarketData";
import { useAccount } from "wagmi";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { format } from "date-fns";

export default function PortfolioPage() {
  const { address: evmAddress } = useAccount();
  const userAddress = evmAddress || undefined;
  const {
    balance: tokenBalance,
    symbol: tokenSymbol,
    isLoading: balanceLoading,
    isError: balanceError,
  } = useTokenBalance(userAddress);

  const {
    price: currentPrice,
    previousClose,
    isLoading: priceLoading,
    error: priceError,
  } = useMarketData("LQD");

  const { username, loading } = useCurrentUser();

  // Format number to 3 decimal places
  const formatNumber = (num: number) => {
    return Number(num.toFixed(3)).toLocaleString();
  };

  // Format percentage to 2 decimal places
  const formatPercent = (num: number) => {
    return Number(num.toFixed(2));
  };

  // Portfolio data using actual token balance and market price
  const portfolioValue =
    tokenBalance && currentPrice ? tokenBalance * currentPrice : 0;

  // Calculate daily change based on previous close
  const previousDayValue =
    tokenBalance && previousClose ? tokenBalance * previousClose : 0;

  const dayChange = portfolioValue - previousDayValue;
  const dayChangePercent =
    previousDayValue > 0
      ? ((portfolioValue - previousDayValue) / previousDayValue) * 100
      : 0;

  // Calculate total return
  const totalReturn = dayChange;
  const totalReturnPercent = dayChangePercent;

  const holdings = [
    {
      symbol: tokenSymbol || "LQD",
      name: "Afro Finance US Corporate Bond Token",
      shares: tokenBalance || 0,
      avgPrice: previousClose || 0,
      currentPrice: currentPrice ?? 0,
      value: portfolioValue,
      dayChange: formatPercent(dayChangePercent),
      totalReturn: formatPercent(totalReturnPercent),
      allocation: 100,
    },
  ];

  const isLoading = balanceLoading || priceLoading;

  // Calculate last updated time (simulating 1 minute ago)
  const lastUpdated = new Date(Date.now() - 60000);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-6">
      {/* Dark Slate Header */}
      <div className="bg-gradient-to-r from-slate-600 via-slate-700 to-slate-800 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.1),transparent_50%)]"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-slate-100 mb-2">
                Last updated {format(lastUpdated, "m")} min ago
              </p>
              <h1 className="text-4xl font-bold">Portfolio Overview</h1>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold mb-2">
                ${formatNumber(portfolioValue)}
              </div>
              <div className="flex items-center justify-end text-slate-100">
                <TrendingUp className="h-4 w-4 mr-1" />
                {dayChange >= 0 ? "+" : ""}
                {formatPercent(Math.abs(dayChange))} (
                {dayChangePercent >= 0 ? "+" : ""}
                {formatPercent(Math.abs(dayChangePercent))}%)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-slate-600 mx-auto mb-4" />
            <p className="text-slate-600">Loading your portfolio...</p>
          </div>
        </div>
      )}

      {!isLoading && (
        <>
          {/* Three Summary Cards - Reserve Style */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 relative py-10 mb-12">
            {/* Total Value Card */}
            <div className="flex flex-col lg:border-r py-10 relative group/feature border-slate-200">
              <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-slate-100 to-transparent pointer-events-none" />
              <div className="mb-4 relative z-10 px-10 text-slate-600">
                <DollarSign className="w-8 h-8" />
              </div>
              <div className="text-lg font-bold mb-2 relative z-10 px-10">
                <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-slate-300 group-hover/feature:bg-slate-400 transition-all duration-200 origin-center" />
                <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-slate-900">
                  ${formatNumber(portfolioValue)}
                </span>
              </div>
              <div>
                <p className="text-sm text-slate-600 max-w-xs relative z-10 px-10 mb-3">
                  Total Value
                </p>
                <div className="px-10">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-slate-600">Daily Change</span>
                    <span className="font-bold text-slate-900">
                      {dayChangePercent >= 0 ? "+" : ""}
                      {formatPercent(Math.abs(dayChangePercent))}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-600">Last Updated</span>
                    <span className="text-xs font-semibold text-slate-900">
                      Now
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Return Card */}
            <div className="flex flex-col lg:border-r py-10 relative group/feature border-slate-200">
              <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-emerald-50 to-transparent pointer-events-none" />
              <div className="mb-4 relative z-10 px-10 text-emerald-600">
                <TrendingUp className="w-8 h-8" />
              </div>
              <div className="text-lg font-bold mb-2 relative z-10 px-10">
                <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-emerald-400 group-hover/feature:bg-emerald-500 transition-all duration-200 origin-center" />
                <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-slate-900">
                  {totalReturn >= 0 ? "+" : "-"}$
                  {formatNumber(Math.abs(totalReturn))}
                </span>
              </div>
              <div>
                <p className="text-sm text-slate-600 max-w-xs relative z-10 px-10 mb-3">
                  Total Return
                </p>
                <div className="px-10">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-slate-600">Return %</span>
                    <span className="font-bold text-emerald-600">
                      {totalReturnPercent >= 0 ? "+" : ""}
                      {formatPercent(Math.abs(totalReturnPercent))}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-600">Period</span>
                    <span className="text-xs font-semibold text-slate-900">
                      All Time
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Positions Card */}
            <div className="flex flex-col py-10 relative group/feature border-slate-200">
              <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-slate-100 to-transparent pointer-events-none" />
              <div className="mb-4 relative z-10 px-10 text-slate-600">
                <PieChart className="w-8 h-8" />
              </div>
              <div className="text-lg font-bold mb-2 relative z-10 px-10">
                <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-slate-300 group-hover/feature:bg-slate-400 transition-all duration-200 origin-center" />
                <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-slate-900">
                  {holdings.length} Position{holdings.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div>
                <p className="text-sm text-slate-600 max-w-xs relative z-10 px-10 mb-3">
                  Active Holdings
                </p>
                <div className="px-10">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-slate-600">Type</span>
                    <span className="font-bold text-slate-900">Bonds</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-600">Allocation</span>
                    <span className="text-xs font-semibold text-slate-900">
                      100%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Holdings & Performance (2/3 width) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Holdings Section */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/30">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                  Holdings
                </h2>
                <div className="space-y-4">
                  {holdings.map((holding) => (
                    <div
                      key={holding.symbol}
                      className="relative p-4 bg-gradient-to-r from-slate-50 to-transparent rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-slate-50/50 transition-all duration-200 group/holding"
                    >
                      <div className="absolute left-0 inset-y-0 h-4 group-hover/holding:h-6 w-1 rounded-tr-full rounded-br-full bg-emerald-400 group-hover/holding:bg-emerald-500 transition-all duration-200 origin-center" />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-12 h-12 bg-gradient-to-br from-slate-500 to-slate-700 rounded-full flex items-center justify-center flex-shrink-0 group-hover/holding:shadow-lg transition-shadow">
                            <span className="font-bold text-white text-lg">
                              {holding.symbol[0]}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-lg text-slate-900">
                                {holding.symbol}
                              </h3>
                            </div>
                            <p className="text-sm text-slate-600 truncate">
                              {holding.name}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {formatNumber(holding.shares)} shares • $
                              {formatNumber(holding.currentPrice)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <div className="text-xl font-bold text-slate-900 mb-1">
                              ${formatNumber(holding.value)}
                            </div>
                            <div
                              className={`text-sm font-medium ${
                                holding.dayChange >= 0
                                  ? "text-emerald-600"
                                  : "text-red-600"
                              }`}
                            >
                              {holding.dayChange >= 0 ? "+" : ""}
                              {holding.dayChange}%
                            </div>
                          </div>
                          <div className="w-16 h-12 flex-shrink-0">
                            <svg className="w-full h-full" viewBox="0 0 64 48">
                              <defs>
                                <linearGradient
                                  id={`gradient-${holding.symbol}`}
                                  x1="0%"
                                  y1="0%"
                                  x2="0%"
                                  y2="100%"
                                >
                                  <stop
                                    offset="0%"
                                    stopColor="#10b981"
                                    stopOpacity="0.3"
                                  />
                                  <stop
                                    offset="100%"
                                    stopColor="#10b981"
                                    stopOpacity="0"
                                  />
                                </linearGradient>
                              </defs>
                              <path
                                d="M 0 36 Q 16 24, 32 18 T 64 12"
                                fill="none"
                                stroke="#10b981"
                                strokeWidth="2"
                              />
                              <path
                                d="M 0 36 Q 16 24, 32 18 T 64 12 L 64 48 L 0 48 Z"
                                fill={`url(#gradient-${holding.symbol})`}
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <Badge
                          variant="secondary"
                          className="bg-slate-100 text-slate-700 border-slate-200 text-xs"
                        >
                          Bond Token
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance Section */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/30">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                  Performance
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative p-4 bg-gradient-to-br from-emerald-50 to-transparent rounded-xl border border-emerald-200 hover:border-emerald-400 transition-all duration-200 group/perf">
                      <div className="absolute left-0 inset-y-0 h-3 group-hover/perf:h-4 w-1 rounded-tr-full rounded-br-full bg-emerald-400 group-hover/perf:bg-emerald-500 transition-all duration-200 origin-center" />
                      <div className="text-xs text-emerald-600 mb-2 font-medium">
                        30-Day Return
                      </div>
                      <div className="text-2xl font-bold text-slate-900">
                        +5.2%
                      </div>
                      <div className="text-xs text-slate-500 mt-2">
                        Current period
                      </div>
                    </div>
                    <div className="relative p-4 bg-gradient-to-br from-emerald-50 to-transparent rounded-xl border border-emerald-200 hover:border-emerald-400 transition-all duration-200 group/perf">
                      <div className="absolute left-0 inset-y-0 h-3 group-hover/perf:h-4 w-1 rounded-tr-full rounded-br-full bg-emerald-400 group-hover/perf:bg-emerald-500 transition-all duration-200 origin-center" />
                      <div className="text-xs text-emerald-600 mb-2 font-medium">
                        90-Day Return
                      </div>
                      <div className="text-2xl font-bold text-slate-900">
                        +12.8%
                      </div>
                      <div className="text-xs text-slate-500 mt-2">
                        Quarterly
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Portfolio Insights (1/3 width) */}
            <div className="lg:col-span-1">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/30">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                  Portfolio Insights
                </h2>
                <div className="space-y-6">
                  {/* Asset Allocation */}
                  <div className="relative p-4 bg-gradient-to-br from-emerald-50 to-transparent rounded-xl border border-emerald-200 group/asset">
                    <div className="absolute left-0 inset-y-0 h-3 group-hover/asset:h-4 w-1 rounded-tr-full rounded-br-full bg-emerald-400 group-hover/asset:bg-emerald-500 transition-all duration-200 origin-center" />
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-slate-900">
                        Asset Allocation
                      </span>
                      <span className="text-sm font-bold text-emerald-600">
                        100% Bonds
                      </span>
                    </div>
                    <div className="relative w-full h-24 flex items-center justify-center">
                      <svg
                        className="w-24 h-24 transform -rotate-90"
                        viewBox="0 0 100 100"
                      >
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="#e2e8f0"
                          strokeWidth="8"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="#64748b"
                          strokeWidth="8"
                          strokeDasharray={`${100 * 2 * Math.PI * 40} ${2 * Math.PI * 40}`}
                          strokeDashoffset="0"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Risk Profile */}
                  <div className="relative p-4 bg-gradient-to-br from-slate-50 to-transparent rounded-xl border border-slate-200 group/risk">
                    <div className="absolute left-0 inset-y-0 h-3 group-hover/risk:h-4 w-1 rounded-tr-full rounded-br-full bg-slate-400 group-hover/risk:bg-slate-500 transition-all duration-200 origin-center" />
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-900">
                        Risk Profile
                      </span>
                      <span className="text-sm font-bold text-slate-600">
                        Conservative
                      </span>
                    </div>
                  </div>

                  {/* Daily Change */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-slate-900">
                        Daily Change
                      </span>
                      <span
                        className={`text-sm font-bold ${
                          dayChange >= 0 ? "text-emerald-600" : "text-red-600"
                        }`}
                      >
                        {dayChange >= 0 ? "+" : ""}
                        {formatPercent(Math.abs(dayChangePercent))}%
                      </span>
                    </div>
                    <Link href="/app/trade">
                      <Button
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                        size="sm"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Position
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
