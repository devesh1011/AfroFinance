"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Search,
  BarChart3,
  Activity,
  ArrowRight,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Popular stocks with company names - prices will be fetched from API
const popularStocks = [
  {
    ticker: "AAPL",
    name: "Apple Inc.",
    price: 0,
    change: 0,
    changePercent: 0,
    volume: "0",
    marketCap: "0",
  },
  {
    ticker: "TSLA",
    name: "Tesla, Inc.",
    price: 0,
    change: 0,
    changePercent: 0,
    volume: "0",
    marketCap: "0",
  },
  {
    ticker: "MSFT",
    name: "Microsoft Corporation",
    price: 0,
    change: 0,
    changePercent: 0,
    volume: "0",
    marketCap: "0",
  },
  {
    ticker: "GOOGL",
    name: "Alphabet Inc.",
    price: 0,
    change: 0,
    changePercent: 0,
    volume: "0",
    marketCap: "0",
  },
  {
    ticker: "AMZN",
    name: "Amazon.com, Inc.",
    price: 0,
    change: 0,
    changePercent: 0,
    volume: "0",
    marketCap: "0",
  },
  {
    ticker: "NVDA",
    name: "NVIDIA Corporation",
    price: 0,
    change: 0,
    changePercent: 0,
    volume: "0",
    marketCap: "0",
  },
  {
    ticker: "META",
    name: "Meta Platforms, Inc.",
    price: 0,
    change: 0,
    changePercent: 0,
    volume: "0",
    marketCap: "0",
  },
  {
    ticker: "IBM",
    name: "IBM Corporation",
    price: 0,
    change: 0,
    changePercent: 0,
    volume: "0",
    marketCap: "0",
  },
];

// African stocks
const africanStocks = [
  {
    ticker: "BHP",
    name: "BHP Group Limited",
    exchange: "JSE",
    country: "South Africa",
    price: 0,
    change: 0,
    changePercent: 0,
    volume: "0",
    marketCap: "0",
  },
];

interface StockData {
  ticker: string;
  name: string;
  exchange?: string;
  country?: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  marketCap: string;
  dataSource?: string;
}

export default function MarketsPage() {
  const [stocks, setStocks] = useState<StockData[]>(popularStocks);
  const [africanStocksData, setAfricanStocksData] =
    useState<StockData[]>(africanStocks);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<string>("african");
  const [searchTerm, setSearchTerm] = useState("");

  const formatMarketCap = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return `$${value.toLocaleString()}`;
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) return `${(volume / 1e9).toFixed(1)}B`;
    if (volume >= 1e6) return `${(volume / 1e6).toFixed(1)}M`;
    if (volume >= 1e3) return `${(volume / 1e3).toFixed(1)}K`;
    return volume.toString();
  };

  const fetchStockData = async (ticker: string) => {
    try {
      const response = await fetch(`/api/stocks/${ticker}`);
      if (response.ok) {
        const data = await response.json();
        return {
          ticker: data.ticker,
          name: popularStocks.find((s) => s.ticker === ticker)?.name || ticker,
          price: data.currentPrice,
          change: data.priceChange,
          changePercent: data.priceChangePercent,
          volume: formatVolume(data.volume),
          marketCap: formatMarketCap(data.marketCap),
          dataSource: data.dataSource,
        };
      }
    } catch (error) {
      console.error(`Error fetching ${ticker}:`, error);
    }
    return null;
  };

  const fetchAfricanStocks = async () => {
    try {
      console.log("[African Stocks] Fetching from API...");
      const response = await fetch("/api/markets/african-stocks?useApi=true");
      console.log("[African Stocks] Response status:", response.status);
      if (response.ok) {
        const data = await response.json();
        console.log("[African Stocks] API Response:", data);
        if (data.data && Array.isArray(data.data)) {
          const enrichedStocks = data.data.map((stock: any) => ({
            ticker: stock.ticker,
            name: stock.name,
            exchange: stock.exchange,
            country: stock.country,
            price: stock.price ?? 0,
            change: stock.change ?? 0,
            changePercent: stock.changePercent ?? 0,
            volume: formatVolume(parseFloat(stock.volume) ?? 0),
            marketCap: stock.marketCap || "N/A",
            dataSource: data.source,
          }));
          console.log("[African Stocks] Enriched stocks:", enrichedStocks);
          return enrichedStocks;
        }
      }
    } catch (error) {
      console.error("Error fetching African stocks:", error);
    }
    return [];
  };

  const fetchAllStocks = useCallback(async () => {
    setRefreshing(true);
    try {
      const promises = popularStocks.map((stock) =>
        fetchStockData(stock.ticker)
      );
      const results = await Promise.all(promises);

      const validStocks = results.filter(
        (stock) => stock !== null
      ) as StockData[];
      setStocks(validStocks);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching stocks:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    console.log("[Markets] Component mounted, fetching data...");
    const loadAllData = async () => {
      setLoading(true);
      try {
        // Fetch both data sources in parallel with timeout
        const result = await Promise.race([
          Promise.all([fetchAllStocks(), fetchAfricanStocks()]),
          new Promise<[void, StockData[]]>((_, reject) =>
            setTimeout(() => reject(new Error("Data load timeout")), 10000)
          ),
        ]);
        const [, africanData] = result;
        console.log("[Markets] Setting African stocks data:", africanData);
        setAfricanStocksData(africanData);
      } catch (error) {
        console.error("[Markets] Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadAllData();
  }, []);

  const filteredStocks = stocks.filter(
    (stock) =>
      stock.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const marketStats = [
    { label: "Total Stocks", value: "500+", icon: BarChart3 },
    { label: "Market Cap", value: "$45.2T", icon: TrendingUp },
    { label: "Active Traders", value: "1,247", icon: Activity },
  ];

  return (
    <div className="space-y-12 max-w-7xl mx-auto px-6">
      {/* Header Section */}
      <div className="pt-8">
        <div className="mb-6">
          <h1 className="text-5xl font-bold text-slate-900 mb-4">
            Stock Markets
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl">
            Track real-time stock prices and market data. Professional-grade
            analytics for informed trading decisions.
          </p>
        </div>
        {lastUpdated && (
          <p className="text-sm text-slate-500">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Market Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {marketStats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div
              key={index}
              className="group relative bg-white/80 backdrop-blur-sm border border-slate-200/30 rounded-2xl p-8 hover:bg-emerald-50/80 transition-all duration-200"
            >
              <div className="absolute left-0 inset-y-0 h-8 group-hover:h-12 w-1 rounded-tr-full rounded-br-full bg-emerald-400 group-hover:bg-emerald-500 transition-all duration-200" />
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-50 rounded-xl">
                  <IconComponent className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search stocks..."
            className="pl-10 bg-white border-slate-200 focus:border-slate-400 rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button
          onClick={fetchAllStocks}
          variant="outline"
          size="sm"
          className={`border-slate-300 hover:border-slate-600 text-slate-700 hover:text-slate-900 rounded-xl ${
            refreshing ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={refreshing}
        >
          <RefreshCw
            className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
          />
          {refreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {/* Tabs for African and Global Markets */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
          <TabsTrigger value="african" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            <span>African Markets</span>
          </TabsTrigger>
          <TabsTrigger value="global">Global Markets</TabsTrigger>
        </TabsList>

        {/* African Markets Tab */}
        <TabsContent value="african">
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="border border-slate-200 rounded-xl p-4 animate-pulse"
                >
                  <div className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="space-y-2 w-24">
                        <div className="h-5 bg-slate-200 rounded w-16"></div>
                        <div className="h-3 bg-slate-200 rounded w-20"></div>
                      </div>
                      <div className="h-8 bg-slate-200 rounded w-24"></div>
                      <div className="h-5 bg-slate-200 rounded w-20"></div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="h-5 bg-slate-200 rounded w-16"></div>
                      <div className="h-5 bg-slate-200 rounded w-12"></div>
                      <div className="h-5 bg-slate-200 rounded w-16"></div>
                      <div className="h-5 bg-slate-200 rounded w-12"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {africanStocksData && africanStocksData.length > 0 ? (
                africanStocksData.map((stock) => (
                  <Link
                    href={`/app/markets/${stock.ticker}`}
                    key={stock.ticker}
                  >
                    <div className="group relative border border-slate-200 rounded-xl p-4 hover:shadow-md hover:border-slate-300 hover:bg-slate-50 transition-all duration-200 cursor-pointer">
                      <div className="absolute left-0 inset-y-0 h-1 group-hover:h-1.5 w-1 rounded-tr-full rounded-br-full bg-emerald-400 group-hover:bg-emerald-500 transition-all duration-200"></div>
                      <div className="flex items-center justify-between gap-6">
                        {/* Left Section: Ticker, Name, Price */}
                        <div className="flex items-center gap-6 flex-1 min-w-0">
                          <div className="flex-shrink-0 w-32">
                            <h3 className="text-lg font-bold text-slate-900 group-hover:text-slate-700 transition-colors">
                              {stock.ticker}
                            </h3>
                            <p className="text-xs text-slate-600 truncate">
                              {stock.name}
                            </p>
                            {stock.country && (
                              <p className="text-xs text-slate-500 mt-1">
                                {stock.country}
                              </p>
                            )}
                          </div>
                          <div className="flex-shrink-0">
                            <span className="text-2xl font-bold text-slate-900">
                              $
                              {stock.price.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                          <div className="flex-shrink-0">
                            <span
                              className={`text-sm font-medium ${
                                stock.change >= 0
                                  ? "text-emerald-600"
                                  : "text-red-600"
                              }`}
                            >
                              {stock.change >= 0 ? "+" : ""}$
                              {stock.change.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* Right Section: Change %, Volume, Market Cap */}
                        <div className="flex items-center gap-6 flex-shrink-0">
                          <Badge
                            variant={
                              stock.change >= 0 ? "default" : "destructive"
                            }
                            className={`text-xs ${
                              stock.change >= 0
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-red-50 text-red-700 border-red-200"
                            }`}
                          >
                            {stock.change >= 0 ? (
                              <TrendingUp className="w-3 h-3 mr-1" />
                            ) : (
                              <TrendingDown className="w-3 h-3 mr-1" />
                            )}
                            {stock.changePercent >= 0 ? "+" : ""}
                            {stock.changePercent.toFixed(2)}%
                          </Badge>
                          <div className="text-right">
                            <span className="block text-xs text-slate-500 mb-0.5">
                              Volume
                            </span>
                            <span className="font-medium text-sm text-slate-900">
                              {stock.volume}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="block text-xs text-slate-500 mb-0.5">
                              Market Cap
                            </span>
                            <span className="font-medium text-sm text-slate-900">
                              {stock.marketCap}
                            </span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors flex-shrink-0" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500">
                  No African stocks data available
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* Global Markets Tab */}
        <TabsContent value="global">
          {loading ? (
            <div className="space-y-3">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="border border-slate-200 rounded-xl p-4 animate-pulse"
                >
                  <div className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="space-y-2 w-24">
                        <div className="h-5 bg-slate-200 rounded w-16"></div>
                        <div className="h-3 bg-slate-200 rounded w-20"></div>
                      </div>
                      <div className="h-8 bg-slate-200 rounded w-24"></div>
                      <div className="h-5 bg-slate-200 rounded w-20"></div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="h-5 bg-slate-200 rounded w-16"></div>
                      <div className="h-5 bg-slate-200 rounded w-12"></div>
                      <div className="h-5 bg-slate-200 rounded w-16"></div>
                      <div className="h-5 bg-slate-200 rounded w-12"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredStocks.map((stock) => (
                <Link href={`/app/markets/${stock.ticker}`} key={stock.ticker}>
                  <div className="group relative border border-slate-200 rounded-xl p-4 hover:shadow-md hover:border-slate-300 hover:bg-slate-50 transition-all duration-200 cursor-pointer">
                    {stock.dataSource === "mock" && (
                      <div className="absolute top-3 right-3">
                        <Badge
                          variant="secondary"
                          className="text-xs bg-orange-50 text-orange-700 border-orange-200"
                        >
                          DEMO
                        </Badge>
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-6">
                      {/* Left Section: Ticker, Name, Price */}
                      <div className="flex items-center gap-6 flex-1 min-w-0">
                        <div className="flex-shrink-0 w-32">
                          <h3 className="text-lg font-bold text-slate-900 group-hover:text-slate-700 transition-colors">
                            {stock.ticker}
                          </h3>
                          <p className="text-xs text-slate-600 truncate">
                            {stock.name}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <span className="text-2xl font-bold text-slate-900">
                            $
                            {stock.price.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                        <div className="flex-shrink-0">
                          <span
                            className={`text-sm font-medium ${
                              stock.change >= 0
                                ? "text-emerald-600"
                                : "text-red-600"
                            }`}
                          >
                            {stock.change >= 0 ? "+" : ""}$
                            {stock.change.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Right Section: Change %, Volume, Market Cap */}
                      <div className="flex items-center gap-6 flex-shrink-0">
                        <Badge
                          variant={
                            stock.change >= 0 ? "default" : "destructive"
                          }
                          className={`text-xs ${
                            stock.change >= 0
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-red-50 text-red-700 border-red-200"
                          }`}
                        >
                          {stock.change >= 0 ? (
                            <TrendingUp className="w-3 h-3 mr-1" />
                          ) : (
                            <TrendingDown className="w-3 h-3 mr-1" />
                          )}
                          {stock.changePercent >= 0 ? "+" : ""}
                          {stock.changePercent.toFixed(2)}%
                        </Badge>
                        <div className="text-right">
                          <span className="block text-xs text-slate-500 mb-0.5">
                            Volume
                          </span>
                          <span className="font-medium text-sm text-slate-900">
                            {stock.volume}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="block text-xs text-slate-500 mb-0.5">
                            Market Cap
                          </span>
                          <span className="font-medium text-sm text-slate-900">
                            {stock.marketCap}
                          </span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors flex-shrink-0" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Market Overview */}
      <div className="border border-slate-200 rounded-2xl p-8 bg-white">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Market Overview
          </h2>
          <p className="text-slate-600">Major market indices and performance</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="group relative bg-white/80 backdrop-blur-sm border border-slate-200/30 rounded-xl p-6 hover:bg-emerald-50/80 transition-all duration-200">
            <div className="absolute left-0 inset-y-0 h-8 group-hover:h-12 w-1 rounded-tr-full rounded-br-full bg-emerald-400 group-hover:bg-emerald-500 transition-all duration-200" />
            <div className="pl-4">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                S&P 500
              </h3>
              <div className="text-3xl font-bold text-slate-900 mb-1">
                4,567.89
              </div>
              <div className="text-emerald-600 text-sm font-medium">
                +12.34 (+0.27%)
              </div>
            </div>
          </div>
          <div className="group relative bg-white/80 backdrop-blur-sm border border-slate-200/30 rounded-xl p-6 hover:bg-red-50/80 transition-all duration-200">
            <div className="absolute left-0 inset-y-0 h-8 group-hover:h-12 w-1 rounded-tr-full rounded-br-full bg-red-300 group-hover:bg-red-400 transition-all duration-200" />
            <div className="pl-4">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                NASDAQ
              </h3>
              <div className="text-3xl font-bold text-slate-900 mb-1">
                14,234.56
              </div>
              <div className="text-red-600 text-sm font-medium">
                -45.67 (-0.32%)
              </div>
            </div>
          </div>
          <div className="group relative bg-white/80 backdrop-blur-sm border border-slate-200/30 rounded-xl p-6 hover:bg-emerald-50/80 transition-all duration-200">
            <div className="absolute left-0 inset-y-0 h-8 group-hover:h-12 w-1 rounded-tr-full rounded-br-full bg-emerald-300 group-hover:bg-emerald-400 transition-all duration-200" />
            <div className="pl-4">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Dow Jones
              </h3>
              <div className="text-3xl font-bold text-slate-900 mb-1">
                34,789.12
              </div>
              <div className="text-emerald-600 text-sm font-medium">
                +89.23 (+0.26%)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
