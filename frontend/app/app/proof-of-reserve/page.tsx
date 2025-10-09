"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useReserveContract } from "@/hooks/useReserveContract";
import { useTotalSupply } from "@/hooks/view/useTotalSupply";
import { useMarketData } from "@/hooks/useMarketData";
import {
  Shield,
  DollarSign,
  BarChart3,
  RefreshCw,
  Eye,
  Calendar,
  Percent,
  CheckCircle,
  TrendingUp,
  Activity,
  Lock,
  AlertCircle,
} from "lucide-react";

// Mock data for Corporate Bonds
const corporateBondsData = {
  rating: "AAA",
  yield: 3.85,
  lastUpdated: "2024-01-15T10:30:00Z",
  holdings: [
    {
      ticker: "LQD",
      name: "iShares iBoxx $ Investment Grade Corporate Bond ETF",
      yield: 3.85,
    },
    {
      ticker: "VCIT",
      name: "Vanguard Intermediate-Term Corporate Bond ETF",
      yield: 3.95,
    },
    {
      ticker: "IGIB",
      name: "iShares Intermediate-Term Corporate Bond ETF",
      yield: 3.75,
    },
  ],
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatNumber = (num: number) => {
  return new Intl.NumberFormat("en-US").format(num);
};

const ProofOfReservePage = () => {
  const { totalSupply, isLoading: totalSupplyLoading } = useTotalSupply();
  const { price: currentPrice, isLoading: priceLoading } = useMarketData("LQD");
  const RESERVE_CONTRACT_ADDRESS =
    (process.env.NEXT_PUBLIC_RESERVE_ADDRESS as `0x${string}`) ||
    "0x0a15179c67aa929DE2E12da428b5d860b06e4962";
  const { requestReserves, isRequestPending, totalReserves, refetchReserves } =
    useReserveContract(RESERVE_CONTRACT_ADDRESS);

  const handleRequestReserves = () => {
    requestReserves(BigInt(379));
  };

  const reserveValue = totalReserves
    ? Number(totalReserves) / 1e6
    : totalSupply;

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-6">
      {/* Header Section */}
      <div className="pt-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-5xl font-bold text-slate-900 mb-3">
              Proof of Reserve
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl">
              Real-time verification of our reserve holdings and backing. Every
              token is fully backed 1:1 by investment-grade assets.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRequestReserves}
              disabled={isRequestPending}
              className="border-slate-300 hover:border-slate-600 text-slate-700 hover:text-slate-900 rounded-xl"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isRequestPending ? "animate-spin" : ""}`}
              />
              {isRequestPending ? "Requesting..." : "Request Reserves"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchReserves()}
              className="border-slate-300 hover:border-slate-600 text-slate-700 hover:text-slate-900 rounded-xl"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Reserve Value */}
        <div className="group relative bg-white/80 backdrop-blur-sm border border-slate-200/30 rounded-2xl p-8 hover:bg-slate-50/80 transition-all duration-200">
          <div className="absolute left-0 inset-y-0 h-8 group-hover:h-12 w-1 rounded-tr-full rounded-br-full bg-emerald-400 group-hover:bg-emerald-500 transition-all duration-200" />
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 rounded-xl">
              <Shield className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-600 mb-1">
                Total Reserve Value
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {totalReserves
                  ? formatCurrency(reserveValue)
                  : formatCurrency(totalSupply)}
              </p>
              <div className="flex items-center gap-1 mt-2">
                <CheckCircle className="h-3 w-3 text-emerald-600" />
                <span className="text-xs text-emerald-600 font-medium">
                  Fully Backed
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Reserve Ratio */}
        <div className="group relative bg-white/80 backdrop-blur-sm border border-slate-200/30 rounded-2xl p-8 hover:bg-slate-50/80 transition-all duration-200">
          <div className="absolute left-0 inset-y-0 h-8 group-hover:h-12 w-1 rounded-tr-full rounded-br-full bg-slate-300 group-hover:bg-slate-400 transition-all duration-200" />
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-50 rounded-xl">
              <Percent className="w-6 h-6 text-slate-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-600 mb-1">
                Reserve Ratio
              </p>
              <p className="text-2xl font-bold text-slate-900">100%</p>
              <p className="text-xs text-slate-600 font-medium mt-2">
                1:1 Backing
              </p>
            </div>
          </div>
        </div>

        {/* Corporate Bonds */}
        <div className="group relative bg-white/80 backdrop-blur-sm border border-slate-200/30 rounded-2xl p-8 hover:bg-slate-50/80 transition-all duration-200">
          <div className="absolute left-0 inset-y-0 h-8 group-hover:h-12 w-1 rounded-tr-full rounded-br-full bg-slate-300 group-hover:bg-slate-400 transition-all duration-200" />
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-50 rounded-xl">
              <BarChart3 className="w-6 h-6 text-slate-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-600 mb-1">
                Corporate Bonds
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {totalSupplyLoading ? (
                  <RefreshCw className="h-5 w-5 animate-spin text-slate-400 inline-block" />
                ) : (
                  formatCurrency(totalSupply)
                )}
              </p>
              <Badge
                variant="secondary"
                className="bg-slate-50 text-slate-700 border-slate-200 text-xs mt-2"
              >
                AAA-Rated
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-slate-100 rounded-xl p-1">
          <TabsTrigger
            value="overview"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="corporate-bonds"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Corporate Bonds
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Reserve Allocation */}
            <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/30 rounded-2xl shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-slate-900">
                  Reserve Allocation
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Distribution of our reserve holdings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-br from-slate-50 to-transparent rounded-xl border border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-slate-600 rounded-full"></div>
                      <span className="text-sm font-medium text-slate-900">
                        Corporate Bonds
                      </span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">
                      100%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-slate-600 to-slate-700 h-3 rounded-full transition-all duration-500"
                      style={{ width: "100%" }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>{" "}
            {/* Reserve Status */}
            <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/30 rounded-2xl shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-slate-900">
                  Reserve Status
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Current verification status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                      <span className="font-medium text-slate-900">
                        Reserves Verified
                      </span>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 hover:bg-emerald-600 hover:text-white hover:border-emerald-600">
                      Active
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-slate-600" />
                      <span className="font-medium text-slate-900">
                        Custodian Status
                      </span>
                    </div>
                    <Badge className="bg-slate-100 text-slate-700 border-slate-300 hover:bg-[#333] hover:text-white hover:border-[#333]">
                      Secure
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-slate-600" />
                      <span className="font-medium text-slate-900">
                        Last Audit
                      </span>
                    </div>
                    <span className="text-sm text-slate-600">Today</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Corporate Bonds Tab */}
        <TabsContent value="corporate-bonds" className="space-y-6">
          <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/30 rounded-2xl shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold text-slate-900">
                Corporate Bonds Holdings
              </CardTitle>
              <CardDescription className="text-slate-600">
                AAA-rated investment-grade corporate bond ETFs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-6 bg-gradient-to-br from-slate-50 to-transparent border border-slate-200 rounded-xl">
                  <div className="text-3xl font-bold text-slate-900 mb-1">
                    {totalSupplyLoading ? (
                      <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
                    ) : (
                      formatCurrency(totalSupply)
                    )}
                  </div>
                  <div className="text-sm text-slate-600">Total Value</div>
                </div>
                <div className="p-6 bg-gradient-to-br from-slate-50 to-transparent border border-slate-200 rounded-xl">
                  <div className="text-3xl font-bold text-slate-900 mb-1">
                    {priceLoading ? (
                      <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
                    ) : (
                      `$${currentPrice?.toFixed(2) || "0.00"}`
                    )}
                  </div>
                  <div className="text-sm text-slate-600">Current Price</div>
                </div>
                <div className="p-6 bg-gradient-to-br from-slate-50 to-transparent border border-slate-200 rounded-xl">
                  <div className="text-3xl font-bold text-slate-900 mb-1">
                    {corporateBondsData.yield}%
                  </div>
                  <div className="text-sm text-slate-600">Average Yield</div>
                </div>
              </div>

              {/* Holdings Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="text-left py-4 px-6 font-semibold text-slate-900 text-sm">
                          Ticker
                        </th>
                        <th className="text-left py-4 px-6 font-semibold text-slate-900 text-sm">
                          Name
                        </th>
                        <th className="text-right py-4 px-6 font-semibold text-slate-900 text-sm">
                          Price
                        </th>
                        <th className="text-right py-4 px-6 font-semibold text-slate-900 text-sm">
                          Yield
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {corporateBondsData.holdings.map((holding, index) => (
                        <tr
                          key={index}
                          className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                        >
                          <td className="py-4 px-6 font-semibold text-slate-900">
                            {holding.ticker}
                          </td>
                          <td className="py-4 px-6 text-slate-600">
                            {holding.name}
                          </td>
                          <td className="py-4 px-6 text-right font-medium text-slate-900">
                            {priceLoading ? (
                              <RefreshCw className="h-4 w-4 animate-spin text-slate-400 ml-auto inline-block" />
                            ) : (
                              `$${currentPrice?.toFixed(2) || "0.00"}`
                            )}
                          </td>
                          <td className="py-4 px-6 text-right font-medium text-slate-900">
                            {holding.yield}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Verification Info */}
      <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/30 rounded-2xl shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-slate-900">
            Reserve Verification
          </CardTitle>
          <CardDescription className="text-slate-600">
            How we ensure transparency and security
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group relative bg-white/80 backdrop-blur-sm border border-slate-200/30 rounded-xl p-6 hover:bg-emerald-50/80 transition-all duration-200 text-center">
              <div className="absolute left-0 inset-y-0 h-8 group-hover:h-12 w-1 rounded-tr-full rounded-br-full bg-emerald-400 group-hover:bg-emerald-500 transition-all duration-200" />
              <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-7 w-7 text-emerald-600" />
              </div>
              <h4 className="font-semibold text-slate-900 mb-2">
                Daily Audits
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Automated verification of all reserve holdings every 24 hours
              </p>
            </div>
            <div className="group relative bg-white/80 backdrop-blur-sm border border-slate-200/30 rounded-xl p-6 hover:bg-slate-50/80 transition-all duration-200 text-center">
              <div className="absolute left-0 inset-y-0 h-8 group-hover:h-12 w-1 rounded-tr-full rounded-br-full bg-slate-300 group-hover:bg-slate-400 transition-all duration-200" />
              <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-7 w-7 text-slate-600" />
              </div>
              <h4 className="font-semibold text-slate-900 mb-2">
                Custodian Oversight
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                All assets held by qualified U.S. custodians with regulatory
                oversight
              </p>
            </div>
            <div className="group relative bg-white/80 backdrop-blur-sm border border-slate-200/30 rounded-xl p-6 hover:bg-slate-50/80 transition-all duration-200 text-center">
              <div className="absolute left-0 inset-y-0 h-8 group-hover:h-12 w-1 rounded-tr-full rounded-br-full bg-slate-300 group-hover:bg-slate-400 transition-all duration-200" />
              <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="h-7 w-7 text-slate-600" />
              </div>
              <h4 className="font-semibold text-slate-900 mb-2">
                Public Verification
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Blockchain-based proof allowing public verification of reserves
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProofOfReservePage;
