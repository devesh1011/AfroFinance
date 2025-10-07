import { NextResponse } from "next/server";

// African Stock Market Tickers
// Currently only BHP is supported via Finnhub free tier
// Other African stocks require premium Finnhub subscription
const AFRICAN_STOCKS = [
  // South African Stocks (JSE)
  {
    ticker: "BHP",
    name: "BHP Group Limited",
    exchange: "JSE",
    fullTicker: "BHP",
  },
];

interface AfricanStockData {
  ticker: string;
  name: string;
  exchange: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  marketCap: string;
  currency: string;
}

interface StockConfig {
  ticker: string;
  name: string;
  exchange: string;
  fullTicker: string;
}

// Option 1: Using alpha-vantage API (Free tier available)
// You'll need to set ALPHA_VANTAGE_API_KEY in .env.local
async function fetchStockDataAlphaVantage(ticker: string): Promise<any> {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  if (!apiKey) {
    console.warn("ALPHA_VANTAGE_API_KEY not set. Using mock data.");
    return null;
  }

  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${apiKey}`
    );
    const data = await response.json();
    return data["Global Quote"];
  } catch (error) {
    console.error(`Error fetching data for ${ticker}:`, error);
    return null;
  }
}

// Option 2: Using Finnhub API (Better for African stocks)
async function fetchStockDataFinnhub(ticker: string): Promise<any> {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    console.warn("FINNHUB_API_KEY not set. Using mock data.");
    return null;
  }

  try {
    console.log(`[Finnhub] Fetching data for ticker: ${ticker}`);
    const response = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${apiKey}`
    );
    const data = await response.json();
    console.log(`[Finnhub] Response for ${ticker}:`, data);

    // Check if we got valid data (Finnhub returns c, d, dp, h, l, o, pc, t fields)
    if (data && data.c !== undefined && data.c !== null) {
      return data;
    }

    console.warn(
      `[Finnhub] No valid price data for ${ticker}. Response:`,
      data
    );
    return null;
  } catch (error) {
    console.error(`[Finnhub] Error fetching data for ${ticker}:`, error);
    return null;
  }
}

// Option 3: Mock data for development/fallback
function getMockStockData(
  ticker: string,
  stock: StockConfig
): AfricanStockData {
  const basePrice = Math.random() * 200 + 50; // Random price between 50-250
  const change = (Math.random() - 0.5) * 10;
  const changePercent = (change / basePrice) * 100;

  return {
    ticker,
    name: stock.name,
    exchange: stock.exchange,
    price: Math.round(basePrice * 100) / 100,
    change: Math.round(change * 100) / 100,
    changePercent: Math.round(changePercent * 100) / 100,
    volume: `${Math.floor(Math.random() * 10000000)}`,
    marketCap: `$${Math.floor(Math.random() * 1000000)}M`,
    currency:
      stock.exchange === "JSE"
        ? "ZAR"
        : stock.exchange === "NGX"
          ? "NGN"
          : "EGP",
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ticker = searchParams.get("ticker");
    const useApi = searchParams.get("useApi") === "true";

    // Fetch single stock or all
    let stocksToFetch = AFRICAN_STOCKS;
    if (ticker) {
      stocksToFetch = AFRICAN_STOCKS.filter((s) => s.ticker.includes(ticker));
    }

    const stockDataPromises = stocksToFetch.map(async (stock) => {
      let data = null;

      // Try API if requested
      if (useApi) {
        // Try Finnhub first with full ticker format (better for international)
        // Finnhub might recognize the ticker with or without exchange suffix
        data = await fetchStockDataFinnhub(stock.ticker);

        // If no data, try with full ticker format
        if (!data || (!data.c && !data["05. price"])) {
          console.log(
            `[Retry] Trying Finnhub with full ticker: ${stock.fullTicker}`
          );
          data = await fetchStockDataFinnhub(stock.fullTicker);
        }

        // Fallback to Alpha Vantage
        if (!data || (!data.c && !data["05. price"])) {
          console.log(`[Fallback] Trying Alpha Vantage for ${stock.ticker}`);
          data = await fetchStockDataAlphaVantage(stock.ticker);
        }
      }

      // Use mock data if no API data
      if (!data || (!data.c && !data["05. price"])) {
        console.log(`[Mock] Using mock data for ${stock.ticker}`);
        return getMockStockData(stock.ticker, stock);
      }

      // Transform API data to our format
      // Finnhub format: { c: price, d: change, dp: changePercent, v: volume, h: high, l: low, o: open, pc: prevClose, t: timestamp }
      // AlphaVantage format: { "05. price": price, "09. change": change, "10. change percent": changePercent, etc }
      return {
        ticker: stock.ticker,
        name: stock.name,
        exchange: stock.exchange,
        price: data.c || parseFloat(data["05. price"]) || 0,
        change: data.d || parseFloat(data["09. change"]) || 0,
        changePercent: data.dp || parseFloat(data["10. change percent"]) || 0,
        volume: (data.v || data["06. volume"] || "N/A").toString(),
        marketCap: "N/A",
        currency:
          stock.exchange === "JSE"
            ? "ZAR"
            : stock.exchange === "NGX"
              ? "NGN"
              : "EGP",
      };
    });

    const stocks = await Promise.all(stockDataPromises);

    return NextResponse.json({
      success: true,
      data: stocks,
      source: useApi ? "live-api" : "mock",
      timestamp: new Date().toISOString(),
      count: stocks.length,
    });
  } catch (error) {
    console.error("African stocks API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch African stock data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
