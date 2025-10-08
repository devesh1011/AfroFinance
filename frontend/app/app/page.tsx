"use client";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  TrendingUp,
  Wallet,
  Settings,
  ArrowRight,
  Activity,
  DollarSign,
  PieChart,
  Users,
  Zap,
  Target,
  Clock,
} from "lucide-react";
import { useTokenBalance } from "@/hooks/view/useTokenBalance";
import { useMarketData } from "@/hooks/useMarketData";
import { useAccount } from "wagmi";

export default function DashboardPage() {
  const { address: evmAddress } = useAccount();
  const userAddress = evmAddress || undefined;
  const {
    balance: tokenBalance,
    symbol: tokenSymbol,
    isLoading: balanceLoading,
  } = useTokenBalance(userAddress);
  const {
    price: currentPrice,
    previousClose,
    isLoading: priceLoading,
    error: priceError,
  } = useMarketData("LQD");

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

  // Holdings logic (single position if tokenBalance > 0)
  const holdings =
    tokenBalance && tokenBalance > 0
      ? [
          {
            symbol: tokenSymbol || "SUSC",
            shares: tokenBalance,
            value: portfolioValue,
          },
        ]
      : [];

  const features = [
    {
      title: "Markets",
      description: "Real-time stock prices and market analytics",
      icon: BarChart3,
      href: "/app/markets",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      stats: "500+ Stocks",
      soon: true,
    },
    {
      title: "Portfolio",
      description: "Track performance and manage investments",
      icon: TrendingUp,
      href: "/app/portfolio",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      stats: "$125K Value",
      soon: false,
    },
    {
      title: "Trade",
      description: "Swap tokens and execute trades instantly",
      icon: Wallet,
      href: "/app/trade",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      stats: "0.1% Fees",
      soon: false,
    },
    {
      title: "Settings",
      description: "Configure account and preferences",
      icon: Settings,
      href: "/app/settings",
      color: "text-slate-600",
      bgColor: "bg-slate-50",
      borderColor: "border-slate-200",
      stats: "Secure",
      soon: true,
    },
  ];

  const quickStats = [
    {
      title: "Portfolio Value",
      value: `$${formatNumber(portfolioValue)}`,
      change: `${dayChange >= 0 ? "+" : "-"}$${formatNumber(Math.abs(dayChange))} (${dayChangePercent >= 0 ? "+" : "-"}${formatPercent(Math.abs(dayChangePercent))}%)`,
      positive: dayChange >= 0,
      icon: DollarSign,
    },
    {
      title: "Active Positions",
      value: holdings.length.toString(),
      change: "Stocks & Tokens",
      positive: null,
      icon: PieChart,
    },
    {
      title: "Today's P&L",
      value: `${dayChange >= 0 ? "+" : "-"}$${formatNumber(Math.abs(dayChange))}`,
      change: `${dayChangePercent >= 0 ? "+" : "-"}${formatPercent(Math.abs(dayChangePercent))}%`,
      positive: dayChange >= 0,
      icon: TrendingUp,
    },
  ];

  const recentActivity = [
    {
      action: "Bought",
      symbol: "AAPL",
      amount: "10 shares",
      time: "2 hours ago",
      value: "+$1,895",
    },
    {
      action: "Sold",
      symbol: "TSLA",
      amount: "5 shares",
      time: "4 hours ago",
      value: "+$1,226",
    },
    {
      action: "Swapped",
      symbol: "USDC → RWA",
      amount: "1,000 tokens",
      time: "6 hours ago",
      value: "+$1,000",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-800 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Badge
              variant="default"
              className="bg-white/20 text-white border-white/30"
            >
              <Zap className="w-4 h-4 mr-2" />
              Live Dashboard
            </Badge>
          </div>
          <h1 className="text-4xl font-bold mb-3">Welcome back</h1>
          <p className="text-emerald-100 text-lg mb-6 max-w-2xl">
            Your portfolio is performing well today. Track your investments,
            execute trades, and stay ahead of the market.
          </p>
          <div className="flex gap-4">
            <Link href="/app/trade">
              <Button
                variant="default"
                className="bg-white text-emerald-600 font-semibold hover:bg-white/90"
              >
                Start Trading
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/app/markets">
              <Button
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 hover:text-white"
              >
                View Markets
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickStats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card
              key={index}
              className="hover:shadow-lg transition-all duration-300 border-0 shadow-md"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-emerald-50 rounded-xl">
                    <IconComponent className="h-5 w-5 text-emerald-600" />
                  </div>
                  {stat.positive !== null && (
                    <Badge
                      variant={stat.positive ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {stat.positive ? "↗" : "↘"}
                    </Badge>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-600">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    {stat.value}
                  </p>
                  <p
                    className={`text-sm ${
                      stat.positive === true
                        ? "text-emerald-600"
                        : stat.positive === false
                          ? "text-red-600"
                          : "text-slate-500"
                    }`}
                  >
                    {stat.change}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature) => {
          const IconComponent = feature.icon;
          const cardContent = (
            <Card
              className={`hover:shadow-xl transition-all duration-300 group border-0 shadow-md ${feature.soon ? "opacity-60 pointer-events-none" : "cursor-pointer"}`}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div
                    className={`p-3 ${feature.bgColor} rounded-2xl group-hover:scale-110 transition-transform duration-300`}
                  >
                    <IconComponent className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {feature.stats}
                    </Badge>
                    {feature.soon && (
                      <Badge
                        variant="outline"
                        className="text-xs bg-yellow-100 text-yellow-800 border-yellow-300"
                      >
                        Soon
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-xl group-hover:text-emerald-600 transition-colors">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    {feature.description}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center text-emerald-600 font-medium text-sm group-hover:translate-x-1 transition-transform duration-300">
                  {feature.soon ? "Coming Soon" : `Open ${feature.title}`}
                  {!feature.soon && <ArrowRight className="ml-2 h-4 w-4" />}
                </div>
              </CardContent>
            </Card>
          );
          return feature.soon ? (
            <div key={feature.title}>{cardContent}</div>
          ) : (
            <Link
              key={feature.title}
              href={feature.href}
              tabIndex={0}
              aria-disabled={false}
            >
              {cardContent}
            </Link>
          );
        })}
      </div>

      {/* Recent Activity */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Recent Activity</CardTitle>
              <CardDescription>
                Your latest trades and transactions
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Activity className="h-4 w-4 mr-2" />
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <span className="font-bold text-emerald-600 text-sm">
                      {activity.symbol[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">
                      {activity.action} {activity.symbol}
                    </p>
                    <p className="text-sm text-slate-600">{activity.amount}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-emerald-600">
                    {activity.value}
                  </p>
                  <div className="flex items-center text-xs text-slate-500">
                    <Clock className="h-3 w-3 mr-1" />
                    {activity.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
